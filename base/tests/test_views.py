import locale
from django.test import TestCase, LiveServerTestCase
from django.conf import settings
from django.core import mail
from selenium import webdriver
from selenium.webdriver.support.wait import WebDriverWait
from base.models import Tag, Article, Tech, save_model

import logging

logger = logging.getLogger("vincis.debug.log")

class ViewsTestCase(TestCase):
    fixtures = ["model.json"]
    
    def test_structure_article(self):
        articulo = Article.objects.get(title="Primer artículo")
        response = self.client.get("/articulo/primer-articulo")
        self.assertContains(response, articulo.title)
        locale.setlocale(locale.LC_ALL, "es_ES")
        self.assertContains(response, articulo.pub_date.strftime("%d {} %Y").format(articulo.pub_date.strftime("%B").capitalize()))
        self.assertContains(response, articulo.content)
        for tag in articulo.tags.all():
            self.assertContains(response, tag.title)
    
    def test_structure_tech(self):
        tech = Tech.objects.get(title="Tecnicismo problemático")
        response = self.client.get("/tecnicismo/tecnicismo-problematico")
        self.assertContains(response, "No existe")
        self.assertContains(response, "Cuidado con los espacios en blanco")
        for other in tech.others.all():
            self.assertContains(response, other.title)
        for informe in tech.report_set.all():
            self.assertContains(response, informe.title)
    
    def test_structure_section(self):
        articulos = Article.objects.all().order_by("-pub_date")
        response = self.client.get("/articulos")
        for articulo in articulos:
            self.assertContains(response, articulo.pub_date.strftime("%d {} %Y").format(articulo.pub_date.strftime("%B").capitalize()))
            self.assertContains(response, articulo.summary)
            for tag in articulo.tags.all():
                self.assertContains(response, tag.title)
    
    def test_pagination(self):
        articulos = Article.objects.all().order_by("-pub_date")
        with self.settings(MAXARTICLES=1):
            response = self.client.get("/articulos", {"page": 1})
            self.assertContains(response, articulos[0].summary)
            self.assertNotContains(response, articulos[1].summary)
            response = self.client.get("/articulos", {"page": 2})
            self.assertContains(response, articulos[1].summary)
            self.assertNotContains(response, articulos[0].summary)
            
    def test_email(self):
        mail.mail_admins("Tema cualquiera", "Mensaje")
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].subject, "{}Tema cualquiera".format(settings.EMAIL_SUBJECT_PREFIX))
        response = self.client.post("/send-mail", {"subject": "hola", "message": "adios"})
        self.assertEqual(len(mail.outbox), 2)
        self.assertEqual(mail.outbox[1].subject, "{}hola".format(settings.EMAIL_SUBJECT_PREFIX))
    
class FunctionalTest(LiveServerTestCase):
    fixtures = ["model.json"]
    
    def setUp(self):
        self.browser = webdriver.Firefox()
        self.browser.implicitly_wait(3)
        self.wait = WebDriverWait(self.browser, 10)

    def tearDown(self):
        self.browser.quit()

    def test_syntax_highlighter(self):
        self.browser.get(self.live_server_url + "/tecnicismo/codigo")
        pres = self.browser.find_elements_by_css_selector(".syntaxhighlighter")
        self.assertEqual(len(pres), 4)