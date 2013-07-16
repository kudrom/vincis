import os, os.path
from whoosh.fields import Schema, TEXT, ID, KEYWORD, DATETIME
from whoosh.index import create_in, open_dir
from base.models import Page, Tag
from django.conf import settings
import logging

logger = logging.getLogger("vincis.console")

def initialize():
    schema = Schema(title=TEXT, 
                    summary=TEXT, 
                    tags=KEYWORD(commas=True), 
                    url=ID(stored=True, unique=True), 
                    pub_date=DATETIME)
    
    if not os.path.exists(settings.INDEX):
        os.mkdir(settings.INDEX)
        
    ix = create_in(settings.INDEX, schema)
    return ix


def index_vincis():
    ix = initialize()
    writer = ix.writer()
    objects = Page.objects.all()
    for object in objects:
        tags = map(lambda x: x.title, object.tags.all())
        writer.add_document(title=object.title, 
                            summary=object.summary, 
                            tags=",".join(tags), 
                            url=object.url, 
                            pub_date=object.pub_date)
    writer.commit()

def reindex_document(documuent):
    ix = open_dir(settings.INDEX)
    writter = ix.writer()
    tags = map(lambda x: x.title, document.tags.all())
    writer.update_document(title=document.title, 
                           summary=document.summary, 
                           tags=",".join(tags), 
                           url=document.url, 
                           pub_date=document.pub_date)
    writer.commit()

def delete_document(document):
    ix = open_dir(settings.INDEX)
    writter = ix.writer()
    tags = map(lambda x: x.title, document.tags.all())
    writer.delete_by_term("url", document.url) 
    writer.commit()

def add_document(document):
    ix = open_dir(settings.INDEX)
    writter = ix.writer()
    tags = map(lambda x: x.title, document.tags.all())
    writer.add_document(title=document.title, 
                        summary=document.summary, 
                        tags=",".join(tags), 
                        url=document.url, 
                        pub_date=document.pub_date)
    writer.commit()