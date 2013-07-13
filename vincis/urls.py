from django.conf.urls import patterns, include, url
from django.contrib import admin
from django.views.generic import TemplateView


admin.autodiscover()

urlpatterns = patterns('',

    url(r'^$', TemplateView.as_view(template_name="home.html"), name='home'),
    url(r'^informe/([\w-]+)$', TemplateView.as_view(template_name="home.html")),
    url(r'^etiqueta/([\w-]+)$', 'base.views.tags'),
    url(r'^([\w]+)s$', 'base.views.section'),
    url(r'^([\w]+)/([\w-]+)$', 'base.views.story'),

    # url(r'^$', 'page.views.home', name="home"),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    url(r'^admin/', include(admin.site.urls)),
)
