from django.db import models
from base.models import Page, Tech, save_model, PageAdmin
from django.contrib import admin
from django.utils.translation import ugettext as _
from django.conf import settings
from django.forms import ModelForm


class Report(Page):
    technicality = models.ManyToManyField(Tech, blank=True,
                                          verbose_name=_("technicality"))

    def __unicode__(self):
        return '{} a {}'.format(self.title, self.pub_date)

    class Meta():
        verbose_name = _("report")
        verbose_name_plural = _("reports")


class ReportForm(ModelForm):
    """ Custom ModelForm to allow change the default for the url """
    class Meta:
        model = Report

    def __init__(self, *args, **kwargs):
        super(ReportForm, self).__init__(*args, **kwargs)
        self.fields['url'].initial = settings.LOCALHOST + "/informe/"


class ReportAdmin(PageAdmin):
    fields = ('title', 'summary', 'tags', 'url', 'technicality')
    list_display = ('title', 'pub_date', 'url')
    form = ReportForm

    def save_model(self, request, model, form, changed):
        save_model(model, "/informe/")

admin.site.register(Report, ReportAdmin)
