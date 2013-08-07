from django.conf.urls import patterns, include, url
from django.views.generic import TemplateView

urlpatterns = patterns('',

    url(r'^sistema-electoral$', TemplateView.as_view(template_name="loreg.html")),
)