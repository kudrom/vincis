from django.conf.urls import patterns, include, url
from django.views.generic import TemplateView

urlpatterns = patterns('',

    url(r'^informe-de-control$', TemplateView.as_view(template_name="prueba.html")),
)