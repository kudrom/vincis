import os
from django.core.management.base import BaseCommand
from django.conf import settings
from whoosh.fields import Schema, TEXT, KEYWORD, NUMERIC, DATETIME
from whoosh.index import create_in 
from base.models import Page
import logging

logger = logging.getLogger("vincis.debug.log")


class Command(BaseCommand):
    args = "nothing"
    help = "index vincis"
    
    def handle(self, *args, **kwargs):
        """ Creates the index iterating over all the pages of the site """
        schema = Schema(pk=NUMERIC(unique=True, stored=True),
                        title=TEXT, 
                        summary=TEXT, 
                        tags=KEYWORD(commas=True, scorable=True),
                        pub_date=DATETIME(sortable=True))
        
        if not os.path.exists(settings.INDEX):
            os.mkdir(settings.INDEX)
            
        ix = create_in(settings.INDEX, schema)
        writer = ix.writer()
        objects = Page.objects.all()
        for object in objects:
            tags = map(lambda x: x.title, object.tags.all())
            writer.add_document(title=object.title, 
                                summary=object.summary, 
                                tags=",".join(tags),
                                pk=object.pk,
                                pub_date=object.pub_date)
        writer.commit()