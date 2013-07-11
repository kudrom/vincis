from django.shortcuts import render, get_object_or_404
from base.models import Page, Tech, Article, Tag
from report.models import Report
from django.views.defaults import page_not_found
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.conf import settings
import logging

logger = logging.getLogger('vincis.console')


def story(request, section, title):
    """ View function for all the content except the reports """
    url = settings.LOCALHOST + "/" + section + "/" + title
    model = {"tecnicismo": Tech, "articulo": Article}
    resource = get_object_or_404(model[section], url=url)
    context = {"resource": resource}
    if section == "tecnicismo":
        reports = Tech.objects.get(url=url).report_set.all().order_by("pub_date")
        context["reports"] = reports[:5]
        aux = []
        for line in resource.toc.split("\n"):
            entry = line.split("->")
            aux.append({"href": resource.url + "#" + entry[1].strip(), "content": entry[0]})
        context["toc"] = aux
    if section in model:
        return render(request, section + ".html", context)
    else:
        return page_not_found(request)


def add_paginator(object_list, request):
    """ Auxiliar function to add pagination to a page """
    paginator = Paginator(object_list, 10)

    page = request.GET.get('page') if request.GET.get('page') != None else 1
    try:
        articles = paginator.page(page)
    except EmptyPage:
        articles = paginator.page(paginator.num_pages)
    pages = paginator.page_range[max([int(page) - 4, 0]) : min([int(page) + 4, paginator.num_pages])]
    return articles, pages


def section(request, section):
    """ Function view for the global sections of the blog """
    model = {"informe": Report, "tecnicismo": Tech, "articulo": Article}
    if section in model:
        object_list = model[section].objects.all()
        articles, pages = add_paginator(object_list, request)
        
        return render(request, 'section.html', {"section": section, "articles": articles, "pages": pages})
    else:
        return page_not_found(request)
    
def tags(request, item):
    """ Function view for the tag pages """
    tag = get_object_or_404(Tag, item=item)
    object_list = Page.objects.filter(tags=tag)
    articles, pages = add_paginator(object_list, request)
    return render(request, 'etiqueta.html', {'articles': articles, 'tag': item, "pages": pages})
