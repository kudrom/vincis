import re
from unidecode import unidecode
from django.db import models
from django.contrib import admin
from django.utils.translation import ugettext as _
from django.forms import ModelForm
from django.conf import settings
from search.reindex import add_document, delete_document
import logging

logger = logging.getLogger('vincis.debug.log')

# Modify the url of a model to substract espaces and transform  the accents
def modified_title(title):
        title = title.lower()
        title = "-".join(filter(lambda x: x != "", re.split(r"\s", title)))
        title = filter(lambda x: x != "/", title)
        title = unidecode(title)
        return title

# Save a model reviewing the url
def save_model(model, section):
    resource = modified_title(model.title)
    if (model.url == settings.LOCALHOST + section):
        model.url += resource
    elif (not model.url.startswith(settings.LOCALHOST + section)):
        model.url = settings.LOCALHOST + section + resource
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
        model.title = unidecode(model.title)
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


class PageAdmin(admin.ModelAdmin):
    """Generic ModelAdmin that updates the index. It isn't registered against the admin page"""
    
    def save_related(self, request, form, formsets, changed):
        super().save_related(request, form, formsets, changed)
        object = Page.objects.get(title=form.cleaned_data['title'])
        if changed:
            # update_document doesn't work so i have to do it manually
            delete_document(object)
            add_document(object)
        else:
            add_document(object)

    def delete_model(self, request, model):
        # If delete_document is after the call to super, the object is erased and the index goes crazy
        delete_document(model)
        super().delete_model(request, model)

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
    """ Custom ModelForm to allow change the default for the url """
    class Meta:
        model = Tech
    
    def __init__(self, *args, **kwargs):
        super(TechForm, self).__init__(*args, **kwargs)
        self.fields['url'].initial = settings.LOCALHOST + "/tecnicismo/"


class TechAdmin(PageAdmin):
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
    """ Custom ModelForm to allow change the default for the url """
    class Meta:
        model = Article
    
    def __init__(self, *args, **kwargs):
        super(ArticleForm, self).__init__(*args, **kwargs)
        self.fields['url'].initial = settings.LOCALHOST + "/articulo/"


class ArticleAdmin(PageAdmin):
    fields = ('title', 'summary', 'content', 'tags', 'url')
    list_display = ('title', 'pub_date', 'url')
    form = ArticleForm

    def save_model(self, request, model, form, changed):
        save_model(model, "/articulo/")


admin.site.register(Tech, TechAdmin)
admin.site.register(Article, ArticleAdmin)
admin.site.register(Tag, TagAdmin)
