import locale, logging
from django.test import TestCase
from django.conf import settings
from django.core.management import call_command
from base.models import Tag, Article, Tech, save_model, Page
from report.models import Report
from ..reindex import add_document, delete_document


console = logging.getLogger("vincis.console")

class ViewsTestCase(TestCase):
    fixtures = ["model.json"]
    
    def setUp(self):
        call_command("index")
    
    def test_structure_search(self):
        """ I don't test the whoosh interface only my implementation"""
        response = self.client.get("/buscar", {"q": "artículo"})
        self.assertContains(response, "Hay 2 resultados para la búsqueda <a>artículo</a>")
        for article in Article.objects.all():
            self.assertContains(response, article.title)
            self.assertContains(response, article.summary)
            locale.setlocale(locale.LC_ALL, "es_ES")
            self.assertContains(response, article.pub_date.strftime("%d {} %Y").format(article.pub_date.strftime("%B").capitalize()))
            for tag in article.tags.all():
                self.assertContains(response, tag.title)
        
        response = self.client.get("/buscar", {"q": "problemático"})
        self.assertContains(response, "Hay 1 resultado para la búsqueda <a>problemático</a>")
    
    def test_empty_search(self):
        response = self.client.get("/buscar", {"q": "fuck"})
        self.assertContains(response, "No hubo resultados para la búsqueda <a>fuck</a>")
        
        # I should add functionality to fail these tests
        response = self.client.get("/buscar", {"q": "articulo"})
        self.assertContains(response, "No hubo resultados para la búsqueda <a>articulo</a>")
        
        response = self.client.get("/buscar", {"q": "artículos"})
        self.assertContains(response, "No hubo resultados para la búsqueda <a>artículos</a>")
    
    def test_redirect_search(self):
        response = self.client.get("/articulos", {'q': 'primer'})
        self.assertRedirects(response, "/buscar?q=primer")
        
        response = self.client.get("/tecnicismos", {'q': 'primer'})
        self.assertRedirects(response, "/buscar?q=primer")
        
        response = self.client.get("/informes", {'q': 'primer'})
        self.assertRedirects(response, "/buscar?q=primer")
        
        response = self.client.get("/articulo/primer-articulo", {'q': 'primer'})
        self.assertRedirects(response, "/buscar?q=primer")
        
        response = self.client.get("/tecnicismo/primer-tecnicismo", {'q': 'primer'})
        self.assertRedirects(response, "/buscar?q=primer")
        
        response = self.client.get("/etiqueta/lorem", {'q': 'primer'})
        self.assertRedirects(response, "/buscar?q=primer")
    
    def test_pagination_search(self):
        articles = Article.objects.all().order_by("-pub_date")
        with self.settings(MAXARTICLES=1):
            response = self.client.get("/buscar", {"q": "artículo", "page": 1})
            self.assertContains(response, articles[0].title)
            self.assertNotContains(response, articles[1].title)
            
            response = self.client.get("/buscar", {"q": "artículo", "page": 2})
            self.assertContains(response, articles[1].title)
            self.assertNotContains(response, articles[0].title)
            
            # Doesn't exists page 3, it should show the last
            response = self.client.get("/buscar", {"q": "artículo", "page": 3})
            self.assertContains(response, articles[1].title)
            self.assertNotContains(response, articles[0].title)
    
    def test_multiple_query(self):
        response = self.client.get("/buscar", {"q": "Pellentesque habitant"})
        self.assertContains(response, "Hay 2 resultados para la búsqueda <a>Pellentesque habitant</a>")
        articles = Article.objects.all()
        for article in articles:
            self.assertContains(response, article.summary)
    
    def test_tags(self):
        articles = Page.objects.filter(tags__title="lorem")
        response = self.client.get("/etiqueta/lorem")
        for article in articles:
            self.assertContains(response, article.title)
            
        articles = Page.objects.filter(tags__title="ipsum wasty")
        response = self.client.get("/etiqueta/ipsum-wasty")
        for article in articles:
            self.assertContains(response, article.title)
    
    def test_empty_tag(self):
        response = self.client.get("/etiqueta/vacia")
        self.assertContains(response, "No hay contenido marcado")
    
    def test_pagination_tags(self):
        articles = Page.objects.filter(tags__title="ipsum wasty").order_by("-pub_date")
        with self.settings(MAXARTICLES=3):
            response = self.client.get("/etiqueta/ipsum-wasty", {"page": 1})
            for i in range(0, 3):
                self.assertContains(response, articles[i].title)
            for i in range(3, 5):
                self.assertNotContains(response, articles[i].title)
                
            response = self.client.get("/etiqueta/ipsum-wasty", {"page": 2})
            for i in range(3, 5):
                self.assertContains(response, articles[i].title)
            for i in range(0, 3):
                self.assertNotContains(response, articles[i].title)
                

class ReindexTestCase(TestCase):
    """ I separate the reindex test cases because they are problematic with the
        pagination test cases """
    fixtures = ["model.json"]
    
    def setUp(self):
        call_command("index")
    
    def test_reindex_tags(self):
        response = self.client.get("/etiqueta/vacia")
        self.assertContains(response, "No hay contenido marcado")
        informe = Report.objects.get(title="Informe de control")
        vacia = Tag.objects.get(title="vacia")
        informe.tags.add(vacia)
        delete_document(informe)
        add_document(informe)
        response = self.client.get("/etiqueta/vacia")
        self.assertContains(response, "Contenido marcado con")
        
        # tear down the index
        informe.tags.remove(vacia)
        delete_document(informe)
        add_document(informe)

    def test_reindex(self):
        response = self.client.get("/buscar", {"q": "artículo"})
        self.assertContains(response, "Hay 2 resultados para la búsqueda <a>artículo</a>")
        response = self.client.get("/buscar", {"q": "modificado"})
        self.assertContains(response, "No hubo resultados para la búsqueda <a>modificado</a>")
        primer = Article.objects.get(title="Segundo artículo")
        primer.title = "Título modificado"
        primer.save()
        delete_document(primer)
        add_document(primer)
        response = self.client.get("/buscar", {"q": "artículo"})
        self.assertContains(response, "Hay 1 resultado para la búsqueda <a>artículo</a>")
        response = self.client.get("/buscar", {"q": "modificado"})
        self.assertContains(response, "Hay 1 resultado para la búsqueda <a>modificado</a>")
        
        # tear down the index
        primer.title = "Segundo artículo"
        primer.save()
        delete_document(primer)
        add_document(primer)