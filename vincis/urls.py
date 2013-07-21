from django.conf.urls import patterns, include, url
from django.contrib import admin
from django.views.generic import TemplateView
from base.views import RSSFeed


admin.autodiscover()

urlpatterns = patterns('',

    url(r'^$', TemplateView.as_view(template_name="home.html"), name='home'),
    url(r'^feed$', RSSFeed()),
    url(r'^buscar$', 'search.views.search'),
    url(r'^send-mail$', 'base.views.send_mail'),
    url(r'^informe/', include("report.urls")),
    url(r'^etiqueta/([\w-]+)$', 'search.views.keywords'),
    url(r'^([\w]+)s$', 'base.views.section'),
    url(r'^([\w]+)/([\w-]+)$', 'base.views.story'),

    # url(r'^$', 'page.views.home', name="home"),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    url(r'^admin/', include(admin.site.urls)),
)
