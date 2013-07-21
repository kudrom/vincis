from django.test import LiveServerTestCase
from django.conf import settings
from django.core import mail
from selenium import webdriver
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.common.keys import Keys
from base.models import Tag, Article, Tech, save_model
from report.models import Report
from time import sleep
import logging

logger = logging.getLogger("vincis.debug.log")
console = logging.getLogger("vincis.console")

class FunctionalTest(LiveServerTestCase):
    fixtures = ["model.json"]
    
    def setUp(self):
        self.browser = webdriver.Firefox()
        self.browser.implicitly_wait(3)
        self.wait = WebDriverWait(self.browser, 10)

    def tearDown(self):
        self.browser.quit()
    
    def test_search(self):
        self.browser.get(self.live_server_url)
        search = self.browser.find_element_by_css_selector("li[role='search'] input")
        self.assertEqual(search.get_attribute("value"), "Buscar")
        search.click()
        search.send_keys("primer")
        search.send_keys(Keys.RETURN)
        self.assertEqual(self.browser.current_url, settings.LOCALHOST + "/buscar?q=primer")
        search = self.browser.find_element_by_css_selector("li[role='search'] input")
        self.assertEqual(search.get_attribute("value"), "primer")
        articles = self.browser.find_elements_by_tag_name("article")
        self.assertEqual(len(articles), 2)
        
        mag_glass = self.browser.find_element_by_css_selector("li[role='search'] i")
        mag_glass.click()
        self.assertEqual(self.browser.current_url, settings.LOCALHOST + "/buscar?q=primer")
        search = self.browser.find_element_by_css_selector("li[role='search'] input")
        self.assertEqual(search.get_attribute("value"), "primer")
        articles = self.browser.find_elements_by_tag_name("article")
        self.assertEqual(len(articles), 2)
        
        form = self.browser.find_element_by_css_selector("li[role='search'] form")
        title = self.browser.find_element_by_css_selector(".wrapper > h2")
        search.click()
        self.assertEqual(form.get_attribute("class"), "selected")
        while len(search.get_attribute("value")) > 0:
            search.send_keys(Keys.DELETE)
        title.click()
        self.assertEqual(form.get_attribute("class"), "")
        self.assertEqual(search.get_attribute("value"), "Buscar")
        search.click()
        search.send_keys("aceituna")
        title.click()
        self.assertEqual(form.get_attribute("class"), "edited")