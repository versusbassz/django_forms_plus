from __future__ import annotations
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from django.db import models

from django.http import JsonResponse
from django import forms
from django.core.files import File

from .types import JsonFormResponse, FormResponseAction
from .spec import transform_image_field_file


__all__ = [
    'json_success_response',
    'json_success_modelform_response',
    'json_fail_response',
    'message_result_action',
]


def json_success_response(
    payload: dict = None,
    action: FormResponseAction = None,
) -> JsonResponse:
    return JsonResponse(JsonFormResponse(
        status='success',
        payload=payload,
        result_action=action,
    ).dict())


def json_success_modelform_response(
    form: forms.BaseForm,
    instance: models.Model,
    payload: dict = None,
    action: FormResponseAction = None,
) -> JsonResponse:
    _payload = {}
    for key, value in payload.items():
        if isinstance(form.fields[key].widget, forms.FileInput):
            if isinstance(value, File):
                _payload[key] = transform_image_field_file(getattr(instance, key))
            else:
                _payload[key] = transform_image_field_file(None)
    return JsonResponse(JsonFormResponse(
        status='success',
        payload=_payload,
        result_action=action,
    ).dict())


def json_fail_response(
    form: forms.BaseForm
) -> JsonResponse:
    return JsonResponse(JsonFormResponse(
        status='fail',
        errors=form.errors,
    ).dict())


def message_result_action(msg: str, meta: dict = None):
    _meta = {} if meta is None else meta
    _meta.update({'message': msg})
    return FormResponseAction(type='message', meta=_meta)
