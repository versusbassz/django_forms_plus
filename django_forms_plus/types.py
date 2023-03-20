from __future__ import annotations
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from .form_helper import Helper

from pydantic import BaseModel
from django import forms


class FormWithHelper(forms.BaseForm):
    helper: Helper


class FormSpec(BaseModel):
    id: str
    action: str
    method: str  # TODO enum or warn instead during building ????
    enctype: str  # TODO enum or warn instead during building ????
    button_text: str
    hidden_fields: list
    fields: dict
    fieldsets: list
    conditional_logic: dict
    i18n_phrases: dict


class FormData(BaseModel):
    value: dict


class FormState(BaseModel):
    spec: FormSpec
    data: FormData
    debug_enabled: bool

    @property
    def dump(self):
        return self.json(indent=4)


class FormResponseAction(BaseModel):
    type: str
    meta: dict


class JsonFormResponse(BaseModel):
    status: str  # Enum: success|fail ???
    errors: dict = {}
    result_action: FormResponseAction | None = None
    payload: dict = {}
