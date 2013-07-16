from django.db import models
from django.contrib import admin
from django.utils.translation import ugettext as _
from django.forms import ModelForm
from django.conf import settings
from unidecode import unidecode
import logging

logger = logging.getLogger('vincis.console')

# Modify the url of a model
def modified_title(title):
        title = title.lower()
        title = "-".join(title.split(" "))
        title = unidecode(title)
        return title

# Save a model reviewing the url
def save_model(model, section):
    if (model.url == settings.LOCALHOST + section):
        resource = modified_title(model.title)
        model.url += resource
    elif (model.url == ""):
        resource = modified_title(model.title)
        model.url += settings.LOCALHOST + section + resource
    else:
        model.url = (model.url)
    model.save()

class Tag(models.Model):
    title = models.CharField(max_length=200, verbose_name=_('item'), unique=True)
    url = models.URLField(editable=False)

    def __unicode__(self):
        return self.title

    class Meta():
        verbose_name = _("tag")
        verbose_name_plural = _("tags")


class TagAdmin(admin.ModelAdmin):
    list_display = ('title',)
    fields = ('title', ) 
    
    def save_model(self, request, model, form, changed):
        model.url = settings.LOCALHOST + "/etiqueta/"+ modified_title(model.title)
        model.save()


class Page(models.Model):
    title = models.CharField(unique=True, max_length=200, verbose_name=_('title'))
    pub_date = models.DateTimeField(auto_now_add=True, verbose_name=_('publishing date'))
    summary = models.TextField(verbose_name=_('summary'))
    tags = models.ManyToManyField(Tag, verbose_name=_('tags'))
    url = models.URLField(blank=True, unique=True)

    class Meta():
        verbose_name = _("page")
        verbose_name_plural = _("pages")


class Tech(Page):
    toc = models.TextField(verbose_name=_("table of contents"))
    content = models.TextField(verbose_name=_("content"))
    others = models.ManyToManyField('self', blank=True, verbose_name=_("other tecnical articles"))

    def __unicode__(self):
        return '{} en {}'.format(self.title, self.url)

    class Meta():
        verbose_name = _("technicality")
        verbose_name_plural = _("technicalities")


class TechForm(ModelForm):
    class Meta:
        model = Tech
    
    def __init__(self, *args, **kwargs):
        super(TechForm, self).__init__(*args, **kwargs)
        self.fields['url'].initial = settings.LOCALHOST + "/tecnicismo/"


class TechAdmin(admin.ModelAdmin):
    fields = ('title', 'summary', 'toc', 'content', 'tags', 'url', 'others')
    list_display = ('title', 'pub_date', 'url')
    form = TechForm

    def save_model(self, request, model, form, changed):
        save_model(model, "/tecnicismo/")


class Article(Page):
    content = models.TextField(verbose_name=_("content"))

    def __unicode__(self):
        return '{} en {}'.format(self.title, self.url)

    class Meta:
        verbose_name = _("article")
        verbose_name_plural = _("articles")


class ArticleForm(ModelForm):
    class Meta:
        model = Article
    
    def __init__(self, *args, **kwargs):
        super(ArticleForm, self).__init__(*args, **kwargs)
        self.fields['url'].initial = settings.LOCALHOST + "/articulo/"


class ArticleAdmin(admin.ModelAdmin):
    fields = ('title', 'summary', 'content', 'tags', 'url')
    list_display = ('title', 'pub_date', 'url')
    form = ArticleForm

    def save_model(self, request, model, form, changed):
        save_model(model, "/articulo/")

admin.site.register(Tech, TechAdmin)
admin.site.register(Article, ArticleAdmin)
admin.site.register(Tag, TagAdmin)
