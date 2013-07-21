from django.test import TestCase
from base.models import Tag, Article, Tech, save_model
from report.models import Report
from django.conf import settings

class URLTestCase(TestCase):
    """ Tests to validate the url of any page, the uniqueness of the URL
        is granted by the django admin app"""
    # fixtures = ["model.json"]
    
    def test_valid_URL_accents(self):
        primerA = Article.objects.create(title="Primér ártícúló",
                                         summary="Hola",
                                         content="Adios")
        save_model(primerA, "/articulo/")
        
        self.assertEqual(primerA.url, settings.LOCALHOST + "/articulo/primer-articulo")
        
    def test_valid_URL_spaces(self):
        primerT = Tech.objects.create(title=" primer  tecnicismo ",
                                      summary="Hola",
                                      content="Adios")
        save_model(primerT, "/tecnicismo/")
        
        self.assertEqual(primerT.url, settings.LOCALHOST + "/tecnicismo/primer-tecnicismo")
        
    def test_valid_URL_slash(self):
        primerI = Report.objects.create(title="/Primer informe/",
                                        summary="Hola")
        save_model(primerI, "/informe/")
        
        self.assertEqual(primerI.url, settings.LOCALHOST + "/informe/primer-informe")
        
    def test_valid_URL_reset(self):
        primerA = Article.objects.create(title="primer-articulo",
                                         summary="Hola",
                                         content="Adios",
                                         url=settings.LOCALHOST + "/articulo/porque-si")
        save_model(primerA, "/articulo/")
        
        self.assertEqual(primerA.url, settings.LOCALHOST + "/articulo/porque-si")
        
        primerA.url = "burrada"
        save_model(primerA, "/articulo/")
        
        self.assertEqual(primerA.url, settings.LOCALHOST + "/articulo/primer-articulo")

