from django.test import LiveServerTestCase
from django.conf import settings
from django.core import mail
from selenium import webdriver
from selenium.webdriver.support.wait import WebDriverWait
from base.models import Tag, Article, Tech, save_model
from report.models import Report

import logging

logger = logging.getLogger("vincis.debug.log")

class FunctionalTest(LiveServerTestCase):
    fixtures = ["model.json"]
    
    def setUp(self):
        self.browser = webdriver.Firefox()
        self.browser.implicitly_wait(3)
        self.wait = WebDriverWait(self.browser, 10)

    def tearDown(self):
        self.browser.quit()

    def test_navigate(self):
        self.browser.get(self.live_server_url + "/articulos")
        primero = Article.objects.order_by("-pub_date")[0]
        articles = self.browser.find_elements_by_tag_name("article")
        self.assertEqual(len(articles), 2)
        articles[0].find_element_by_link_text(primero.title).click()
        
        navigation = self.browser.find_element_by_css_selector('div[role="navigation"]')
        navigation.find_element_by_link_text("Tecnicismos").click()
        segundo = Tech.objects.order_by("-pub_date")[1]
        articles = self.browser.find_elements_by_tag_name("article")
        self.assertEqual(len(articles), 3)
        articles[1].find_element_by_link_text(segundo.title).click()
        
        # Pagination
        with self.settings(MAXARTICLES=1):
            navigation = self.browser.find_element_by_css_selector('div[role="navigation"]')
            body = self.browser.find_element_by_tag_name("body")
            navigation.find_element_by_link_text("Tecnicismos").click()
            articles = self.browser.find_elements_by_tag_name("article")
            self.assertEqual(len(articles), 1)
            self.browser.find_element_by_link_text("2").click()
            articles = self.browser.find_elements_by_tag_name("article")
            self.assertEqual(len(articles), 1)
            articles[0].find_element_by_link_text(segundo.title).click()
        
        navigation = self.browser.find_element_by_css_selector('div[role="navigation"]')
        navigation.find_element_by_link_text("Informes").click()
        body = self.browser.find_element_by_tag_name("body")
        primero = Report.objects.order_by("-pub_date")[0]
        articles = self.browser.find_elements_by_tag_name("article")
        self.assertEqual(len(articles), 1)
        articles[0].find_element_by_link_text(primero.title).click()
        
    def test_email(self):
        self.browser.get(self.live_server_url)
        contact = self.browser.find_elements_by_css_selector(".contact li")[0]
        contact.click()
        self.browser.find_element_by_name("subject").send_keys("Título sin identificar")
        self.browser.find_element_by_name("message").send_keys("Contenido de un mensaje conmovedor")
        self.browser.find_element_by_tag_name("button").click()
        self.assertEqual(len(mail.outbox), 1)
        # self.assertEqual(mail.outbox[0].subject, "{}Título sin identificar ññ".format(settings.EMAIL_SUBJECT_PREFIX))