from typing import Any
from datetime import datetime

from django.db import models
from django import forms
from django.http import HttpRequest, JsonResponse
from django.views.generic.edit import CreateView

from django_forms_plus import (
    DfpFormMixin,
    DfpViewMixin,
    json_success_response, json_fail_response, message_result_action)
import django_forms_plus.widgets as dfp_widgets
from ..misc import AddFormDebugForViewMixin


__all__ = [
    'Recipient',
    'RecipientAddView',
]


def only_if_equal(field: str, expected: Any) -> list[list[dict[str, Any]]]:
    return [
        [
            {
                'field': field,
                'operator': 'equal',
                'value': expected,
            },
        ],
    ]


class Recipient(models.Model):
    class Meta:
        app_label = 'apex'

    class RecipientTypes(models.TextChoices):
        ITSELF = 'itself', 'Itself'
        EXTERNAL = 'external', 'External'

    recipient_type = models.CharField(
        max_length=50,
        choices=RecipientTypes.choices,
        default=RecipientTypes.ITSELF,
    )
    itself_uid = models.CharField(max_length=50, default='', blank=True)
    external_uid = models.CharField(max_length=50, default='', blank=True)


class RecipientAddForm(DfpFormMixin, forms.ModelForm):
    class Meta:
        model = Recipient
        fields = ['recipient_type', 'itself_uid', 'external_uid']
        widgets = {
            'recipient_type': dfp_widgets.RadioSelect(),
        }
        error_messages = {
            'required': '[DFP] Required (local)',
        }

    class DfpMeta:
        form_id = 'recipient_add'
        action = 'blog_react:recipient_add'
        method = 'post'
        fieldsets = [
            {
                'title': 'Section - type',
                'fields': ['recipient_type'],
            },
            {
                'title': 'Section - itself',
                'fields': ['itself_uid'],
                'conditional_logic': only_if_equal('recipient_type', Recipient.RecipientTypes.ITSELF.value),
            },
            {
                'title': 'Section - external',
                'fields': ['external_uid'],
                'conditional_logic': only_if_equal('recipient_type', Recipient.RecipientTypes.EXTERNAL.value),
            },
        ]
        conditional_logic = {
            'itself_uid': only_if_equal('recipient_type', Recipient.RecipientTypes.ITSELF.value),
            'external_uid': only_if_equal('recipient_type', Recipient.RecipientTypes.EXTERNAL.value),
        }


class RecipientAddView(DfpViewMixin, AddFormDebugForViewMixin, CreateView):
    model = Recipient
    form_class = RecipientAddForm
    template_name = 'blog_react/form.html'
    x_page_title = 'Radio (conditional)'

    def post(self, request: HttpRequest, *args, **kwargs) -> JsonResponse:
        form = self.form_class(request.POST)

        if form.is_valid():
            form.save()
            msg = f'Form sent - {datetime.utcnow()}'
            return json_success_response(action=message_result_action(msg))
        else:
            return json_fail_response(form)
