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
    css_classes: dict[str, Any]  # TODO type attrs

    prefix: NotRequired[Any]  # type=slug  # TODO type
    suggestions: NotRequired[Any]  # type=slug  # TODO type
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
    css_classes: NotRequired[Any]  # TODO type
    conditional_logic: NotRequired[Any]  # TODO type


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
    id: str
    action: str
    method: str  # TODO enum or warn instead during building ????
    enctype: str  # TODO enum or warn instead during building ????
    button_text: str
    hidden_fields: HiddenFields
    fields: FieldSpecsDict
    fieldsets: FieldsetSpecList
    conditional_logic: CLSpecsDict
    i18n_phrases: I18nPhrases


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
