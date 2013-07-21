from django.shortcuts import render, get_object_or_404, redirect
from base.models import Page, Tech, Article, Tag, modified_title
from report.models import Report
from django.views.defaults import page_not_found
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.conf import settings
from django.contrib.syndication.views import Feed
from django.utils.translation import ugettext as _
from django.core.mail import mail_admins
from search.views import add_search
import logging, re

logger = logging.getLogger('vincis.debug.log')
console = logging.getLogger('vincis.console')


class RSSFeed(Feed):
    title = _("Vincis RSS feed")
    link = "/feed/"
    description = _("All the content for vincis RSS feed")

    def items(self):
        return Page.objects.order_by("-pub_date")[:20]
    
    def item_title(self, item):
        return item.title
    
    def item_description(self, item):
        return item.summary
    
    def item_pubdate(self, item):
        return item.pub_date
    
    def item_link(self, item):
        return item.url


@add_search
def story(request, section, title):
    """ View function for all the content except the reports """
    url = settings.LOCALHOST + "/" + section + "/" + title
    model = {"tecnicismo": Tech, "articulo": Article}
    templates = {"tecnicismo": "tech", "articulo": "article"}
    resource = get_object_or_404(model[section], url=url)
    context = {"resource": resource}
    if section == "tecnicismo":
        reports = Tech.objects.get(url=url).report_set.all().order_by("-pub_date")
        context["reports"] = reports[:5]
        aux = []
        for line in resource.toc.split("\n"):
            entry = re.split("\s*->", line)
            aux.append({"href": resource.url + "#" + entry[1].strip(), "content": entry[0]})
        context["toc"] = aux
    if section in model:
        return render(request, templates[section] + ".html", context)
    else:
        return page_not_found(request)

@add_search
def section(request, section):
    """ Function view for the global sections of the blog """
    model = {"informe": Report, "tecnicismo": Tech, "articulo": Article}
    if section in model:
        object_list = model[section].objects.all().order_by("-pub_date")
        articles, pages = add_paginator(object_list, request)
        
        return render(request, 'section.html', {"title": section, "articles": articles, "pages": pages})
    else:
        return page_not_found(request)


def add_paginator(object_list, request):
    """ Auxiliar function to add pagination to a page """
    paginator = Paginator(object_list, settings.MAXARTICLES)

    page = request.GET.get('page') if request.GET.get('page') != None else 1
    try:
        articles = paginator.page(page)
    except EmptyPage:
        articles = paginator.page(paginator.num_pages)
    pages = paginator.page_range[max([int(page) - 4, 0]) : min([int(page) + 4, paginator.num_pages])]
    return articles, pages


def send_mail(request):
    if request.method == "POST":
        subject = request.POST["subject"]
        message = request.POST["message"]
        mail_admins(subject, message)
        if 'HTTP_REFERER' in request.META:
            return redirect(request.META['HTTP_REFERER'])
        else:
            return redirect("/")
