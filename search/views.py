from django.shortcuts import render, redirect
from django.conf import settings
from whoosh.index import open_dir
from whoosh.qparser import MultifieldParser, QueryParser
from base.models import Page
import logging

logger = logging.getLogger("vincis.console")

def add_search(view):
    def has_query(request, *args):
        if request.GET.get('q') != None:
            return redirect("/buscar?q=" + request.GET.get('q'))
        else:
            return view(request, *args)
    return has_query

def get_articles(index, query, request):
    page = int(request.GET.get('page')) if request.GET.get('page') != None else 1
    articles = []
    with index.searcher() as searcher:
        results = searcher.search_page(query, page, pagelen=settings.MAXARTICLES, sortedby="pub_date", reverse=True)
        pages = range(max([results.pagenum - 4, 1]), min([results.pagenum + 4, results.pagecount]) + 1)
        for result in results:
            articles.append(Page.objects.get(pk=result["pk"]))
    return articles, pages, results.pagenum

def search(request):
    if request.GET.get("q") == None:
        return redirect("/")
    ix = open_dir(settings.INDEX)
    qp = MultifieldParser(["title", "summary", "tags"], schema=ix.schema)
    q = qp.parse(request.GET.get('q'))
    articles, pages, act_page = get_articles(ix, q, request)
    return render(request, "search.html", {'query': request.GET.get("q"),
                                           "articles": articles,
                                           "pages": pages,
                                           "title": request.GET.get("q"),
                                           "act_page": act_page})

@add_search
def keywords(request, title):
    ix = open_dir(settings.INDEX)
    qp = QueryParser("tags", schema=ix.schema)
    title = '"{}"'.format("".join(map(lambda x: " " if x == "-" else x, title)))
    q = qp.parse(title)
    articles, pages, act_page = get_articles(ix, q, request)
    return render(request, "keywords.html", {'query': request.GET.get("q"),
                                             "articles": articles,
                                             "pages": pages,
                                             "title": title,
                                             "act_page": act_page})
