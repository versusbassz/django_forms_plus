from __future__ import annotations
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from django import forms

from django.http import JsonResponse

from .types import JsonFormResponse, FormResponseAction


__all__ = [
    'json_success_response',
    'json_fail_response',
    'message_result_action',
]


def json_success_response(
    payload: dict = None,
    action: FormResponseAction = None,
) -> JsonResponse:
    return JsonResponse(JsonFormResponse(
        status='success',
        payload=payload if payload is not None else {},
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
