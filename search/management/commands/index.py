from search.setup import index_vincis
from django.core.management.base import BaseCommand
import logging

logger = logging.getLogger("vincis.console")

class Command(BaseCommand):
    args = "nothing"
    help = "index vincis"
    
    def handle(self, *args, **kwargs):
        index_vincis()