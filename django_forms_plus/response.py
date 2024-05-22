from __future__ import annotations
from typing import TYPE_CHECKING, Sequence, Any
if TYPE_CHECKING:
    from django.db import models

import datetime

from django.core.exceptions import NON_FIELD_ERRORS
from django.http import JsonResponse
from django import forms
from django.core.files import File

from .types import JsonFormResponse, FormResponseAction
from .spec import transform_image_field_file


__all__ = [
    'json_success_response',
    'json_success_modelform_response',
    'json_fail_response',
    'json_fail_common_response',
    'message_result_action',
]


def json_success_response(
    payload: dict | None = None,
    action: FormResponseAction | None = None,
) -> JsonResponse:
    payload_ = payload if payload is not None else {}
    form_response = JsonFormResponse(
        status='success',
        payload=payload_,
        result_action=action,
    )
    return JsonResponse(form_response.model_dump())


def json_success_modelform_response(
    form: forms.BaseForm,
    instance: models.Model,
    payload: dict[str, Any] | None = None,
    action: FormResponseAction | None = None,
) -> JsonResponse:
    """
    TODO probably it's better to remove "payload" param completely and only build a payload from form.cleaned_data
    """
    _payload: dict[str, Any] = {}
    if payload is None:
        for key, value in form.cleaned_data.items():
            widget = form.fields[key].widget
            if isinstance(widget, forms.FileInput):
                if isinstance(value, File):
                    _payload[key] = transform_image_field_file(getattr(instance, key))
                else:
                    _payload[key] = transform_image_field_file(None)
            elif isinstance(widget, forms.DateInput) and isinstance(value, datetime.date):
                # value is datetime.date for
                date_format = widget.format
                if date_format is None:
                    _payload[key] = str(value)
                else:
                    _payload[key] = value.strftime(date_format)
            else:
                _payload[key] = value
    else:
        _payload = payload.copy()

    form_response = JsonFormResponse(
        status='success',
        payload=_payload,
        result_action=action,
    )
    return JsonResponse(form_response.model_dump())


def json_fail_response(
    form: forms.BaseForm
) -> JsonResponse:
    # TODO I've forgotten an exact issue led to this dict comprehension, unfortunately
    #      probably it was a typical issue about StrOrPromise conversion to JSON
    #      revisit this code later
    errors = {field_name: [str(s) for s in errors_list] for field_name, errors_list in form.errors.items()}
    response_data = JsonFormResponse(
        status='fail',
        errors=errors,
    ).model_dump()
    return JsonResponse(response_data)


def json_fail_common_response(errors: Sequence) -> JsonResponse:
    return JsonResponse(JsonFormResponse(
        status='fail',
        errors={NON_FIELD_ERRORS: list(errors)},
    ).model_dump())


def message_result_action(msg: str, meta: dict[str, Any] | None = None) -> FormResponseAction:
    _meta = {} if meta is None else meta
    _meta.update({'message': msg})
    return FormResponseAction(type='message', meta=_meta)
