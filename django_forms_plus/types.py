from typing import Union

from pydantic import BaseModel
from django import forms


DjangoForm = Union[forms.Form, forms.ModelForm]


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
