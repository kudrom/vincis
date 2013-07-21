import os
from django.conf import settings
from whoosh.index import open_dir 
import logging

logger = logging.getLogger("vincis.debug.log")


def delete_document(document):
    """ Delete a document from the index """
    ix = open_dir(settings.INDEX)
    writer = ix.writer()
    writer.delete_by_term("pk", document.pk)
    writer.commit()

def add_document(document):
    """ Add a document to the index """
    ix = open_dir(settings.INDEX)
    writer = ix.writer()
    tags = map(lambda x: x.title, document.tags.all())
    writer.add_document(pk=document.pk,
                        title=document.title, 
                        summary=document.summary, 
                        tags=",".join(tags),
                        pub_date=document.pub_date)
    writer.commit()