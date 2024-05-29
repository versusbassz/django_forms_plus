from __future__ import annotations
from typing import Any, TypeAlias
from typing_extensions import TypedDict, NotRequired

from pydantic import BaseModel
from django import forms


# Types

DjangoForm = forms.Form | forms.ModelForm

HiddenFields: TypeAlias = list[str]


class ImageFileInfo(TypedDict):
    exists: bool
    url: str


class LayoutItemSpec(TypedDict):
    type: str
    selector: str


class ValidatorSpec(TypedDict):
    name: str
    type: str
    value: Any  # TODO or str ???
    inverse: bool
    allow_empty: bool
    message: str | None


CssClasses: TypeAlias = dict[str, str]


class FieldSpec(TypedDict):
    name: str
    type: str
    label: str
    help_text: str
    required: bool
    disabled: bool
    readonly: bool | str
    initial: Any
    errors: dict[str, Any]  # TODO type attrs
    attrs: dict[str, Any]
    validators: list[ValidatorSpec]
    soft_validators: list[ValidatorSpec]
    css_classes: CssClasses

    prefix: NotRequired[Any]  # type=slug  # TODO type
    suggestions: NotRequired[list[str]]  # type=slug
    input_format: NotRequired[Any]  # type=text  # TODO type
    label_hint: NotRequired[str]  # type=checkbox
    choices: NotRequired[list[list[str | int]]]  # type=select  # TODO tuple[str, str] instead ??
    checkbox_name: NotRequired[Any]  # type=image  # TODO type
    checkbox_id: NotRequired[Any]  # type=image  # TODO type
    expected_width: NotRequired[Any]  # type=image  # TODO type
    expected_height: NotRequired[Any]  # type=image  # TODO type


FieldSpecsDict: TypeAlias = dict[str, FieldSpec]

FieldsetField: TypeAlias = str | LayoutItemSpec
FieldsetFieldList: TypeAlias = list[FieldsetField]


class FieldsetSpec(TypedDict):
    fields: FieldsetFieldList
    title: NotRequired[str]
    desc: NotRequired[str]
    css_classes: NotRequired[list[str]]
    conditional_logic: NotRequired[CLSpec]


FieldsetSpecList: TypeAlias = list[FieldsetSpec]


class CLSpecRule(TypedDict):
    field: str
    operator: str
    value: NotRequired[str]  # TODO maybe Any ???


CLSpec: TypeAlias = list[list[CLSpecRule]]  # used by fields and fieldsets -> no specificity in the name
CLSpecsDict: TypeAlias = dict[str, CLSpec]

I18nPhrases: TypeAlias = dict[str, str]


# Pydantic models

class FormSpec(BaseModel):
    id: str  # The form id (to be able to use several forms on a page)
    action: str  # The according form attr.
    method: str  # The according form attr.
    enctype: str  # The according form attr.
    button_text: str
    hidden_fields: HiddenFields  # attr:name of <input type:hidden> fields
    fields: FieldSpecsDict  # The most important part. The fields specs by attr:name
    fieldsets: FieldsetSpecList  # The fieldset specs
    conditional_logic: CLSpecsDict  # Fields conditional logic rules by field attr:name
    i18n_phrases: I18nPhrases  # Translated phrases for UI


class FormData(BaseModel):  # TODO is it used ???
    value: dict[str, Any]


class FormState(BaseModel):
    spec: FormSpec
    data: FormData
    debug_enabled: bool

    @property
    def dump(self):
        return self.model_dump_json(indent=4)


class FormResponseAction(BaseModel):
    type: str
    meta: dict[str, Any]


class JsonFormResponse(BaseModel):
    status: str  # Enum: success|fail ???
    errors: dict[str, list[str]] = {}
    result_action: FormResponseAction | None = None
    payload: dict[str, Any] = {}
