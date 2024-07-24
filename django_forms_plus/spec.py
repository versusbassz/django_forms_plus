from __future__ import annotations
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from .types import (
        DjangoForm, FieldSpecsDict, FieldSpec,
        FieldsetSpecList, FieldsetSpec, FieldsetFieldList,
        ValidatorSpec, HiddenFields, ImageFileInfo,
    )


from django.forms import BoundField
from django.db.models.fields.files import ImageFieldFile
from django.core.validators import RegexValidator

from .form_helper import Helper
from .types import FormState, FormSpec, FormData
from .errors import get_global_error_messages, get_error_message
from .layout import LayoutItem


def get_form_spec(form: DjangoForm) -> FormState:
    if not hasattr(form, 'helper') or not isinstance(form.helper, Helper):
        raise TypeError('The form MUST have "helper" attr of Helper (sub-)class')

    if form.helper.spec is not None:  # caching
        # TODO probably, it's better to move the building logic
        #      to a separate build_form_spec() function and keep caching logic here
        # TODO do we need to clear the cache somehow ??? (an func argument / method of an object)
        return form.helper.spec

    helper: Helper = form.helper

    # we need to process bound fields to act closely to the original Django forms logic
    # see django.forms.forms.BaseForm.__iter__
    #     (it's an entry point during rendering forms in templates)
    bound_fields: dict[str, BoundField] = {f_name: form[f_name] for f_name in form.fields}

    fields: FieldSpecsDict = {}
    hidden_fields: HiddenFields = []
    for name, bound_field in bound_fields.items():
        field = bound_field.field
        field_name = field.dfp_field_name if hasattr(field, 'dfp_field_name') else type(field).__name__

        widget = bound_field.field.widget
        widget_name = widget.dfp_widget_name if hasattr(widget, 'dfp_widget_name') else type(widget).__name__

        field_spec: FieldSpec = {
            'name': name,
            'label': str(field.label),
            'help_text': str(field.help_text),
            'required': field.required,
            'disabled': field.disabled,

            # TODO do we really need readonly as a separate property ???
            'readonly': 'readonly' in widget.attrs and widget.attrs['readonly'],
        }

        # initial value
        # TODO handle widget.value ???
        field_spec['initial'] = None
        default_initial = None
        if name in form.initial and form.initial[name] is not None:
            field_spec['initial'] = form.initial[name]
        elif field.initial:
            field_spec['initial'] = field.initial

        # hotfix for DateInput
        if widget_name == 'DateInput':
            if name in form.initial:
                field_spec['initial'] = widget.format_value(form.initial[name])
            else:
                field_spec['initial'] = ''

        # Error messages (i18n)
        # TODO unify the logic
        global_messages = get_global_error_messages()
        field_spec['errors'] = {}

        error_name = 'required'

        if field_spec[error_name]:
            error_value = get_error_message(name, error_name, helper, global_messages)
            field_spec['errors'][error_name] = str(error_value)
        # also see the logic in validators

        # attrs
        field_spec['attrs'] = widget.attrs

        # Validators
        field_spec['validators'] = []

        match field_name:
            case 'CharField':
                if hasattr(field, 'max_length') and field.max_length:
                    field_spec['validators'].append(_get_str_length_validator(field=field, name='max_length'))
                if hasattr(field, 'min_length') and field.min_length:
                    field_spec['validators'].append(_get_str_length_validator(field=field, name='min_length'))

        has_custom_validators = hasattr(helper, 'validators')
        if has_custom_validators and name in helper.validators:
            for validator in helper.validators[name]:
                if validator['name'] == 'required':
                    raise ValueError('"required" prop must not be set via DfpMeta.validators. '
                                     'Set it on a Form\'s Field itself')

                validator_type = validator['type'] if 'type' in validator else validator['name']

                validator_value = validator['value']
                if validator_type == 'regexp':
                    if isinstance(validator['value'], str):
                        # validator['value'] as str (a pattern) is allowed
                        pass
                    else:
                        # The important moments here:
                        # 1. if validator['value'] is not a string we expect it's a re.Pattern
                        # 2. django.core.validators.RegexValidator uses lazy logic
                        #    via django.utils.regex_helper._lazy_re_compile()
                        #    called in RegexValidator.__init__() for RegexValidator.regexp
                        #    So we unwrap it and uses "Re.pattern" attr explicitly
                        # 3. Pydantic v1 transforms re.Pattern to str during BaseModel.json()
                        #    -
                        #    Pydantic v2 just applies str() to a regexp.
                        #    That is incorrect for our case that's why we transform the regexp to str explicitly
                        #    just by using "pattern" attr
                        if not hasattr(validator_value, 'pattern'):
                            raise TypeError(f're.Pattern expected, got {type(validator_value)}')
                        validator_value = validator_value.pattern

                cur_validator: ValidatorSpec = {
                    'name': validator['name'],
                    'type': validator_type,
                    'value': validator_value,
                    'inverse': validator['inverse'] if 'inverse' in validator else False,
                    'allow_empty': validator['allow_empty'] if 'allow_empty' in validator else False,  # TODO is this condition correct  # noqa: E501
                    'message': str(validator['message']) if 'message' in validator else None,
                }
                field_spec['validators'].append(cur_validator)

                if cur_validator['message'] is None:
                    # TODO move this error_messages logic to its main part
                    error_value = get_error_message(name, validator['name'], helper, global_messages)
                    field_spec['errors'][validator['name']] = str(error_value)

        # Soft validators
        # TODO extract the validators (regular & soft) building logic to a class and get rid of copypasta
        field_spec['soft_validators'] = []
        has_soft_validators = hasattr(helper, 'soft_validators') and name in helper.soft_validators
        if has_soft_validators:
            for validator in helper.soft_validators[name]:
                validator_type = validator['type'] if 'type' in validator else validator['name']

                validator_value = validator['value'] if 'value' in validator else None
                if validator_type == 'regexp':
                    if isinstance(validator['value'], str):
                        # validator['value'] as str (a pattern) is allowed
                        pass
                    else:
                        # The important moments here:
                        # 1. if validator['value'] is not a string we expect it's a re.Pattern
                        # 2. django.core.validators.RegexValidator uses lazy logic
                        #    via django.utils.regex_helper._lazy_re_compile()
                        #    called in RegexValidator.__init__() for RegexValidator.regexp
                        #    So we unwrap it and uses "Re.pattern" attr explicitly
                        # 3. Pydantic v1 transforms re.Pattern to str during BaseModel.json()
                        #    -
                        #    Pydantic v2 just applies str() to a regexp.
                        #    That is incorrect for our case that's why we transform the regexp to str explicitly
                        #    just by using "pattern" attr
                        if not hasattr(validator_value, 'pattern'):
                            raise TypeError(f're.Pattern expected, got {type(validator_value)}')
                        validator_value = validator_value.pattern

                soft_validator: ValidatorSpec = {  # for mypy
                    'name': validator['name'],
                    'type': validator_type,
                    'value': validator_value,
                    'inverse': validator['inverse'] if 'inverse' in validator else False,
                    'allow_empty': validator['allow_empty'] if 'allow_empty' in validator else False,
                    'message': str(validator['message']),  # a message is required for now
                }

                field_spec['soft_validators'].append(soft_validator)

        # attr: css_classes
        if hasattr(widget, 'css_classes') and isinstance(widget.css_classes, dict):
            field_spec['css_classes'] = widget.css_classes
        else:
            field_spec['css_classes'] = {}

        # attr: type  + specific settings
        match widget_name:
            case 'SlugInput':
                field_spec['type'] = 'slug'
                field_spec['prefix'] = widget.prefix if hasattr(widget, 'prefix') else ''
                field_spec['suggestions'] = widget.suggestions if hasattr(widget, 'suggestions') else []
                default_initial = ''
            case 'TextInput':
                field_spec['type'] = 'text'
                field_spec['input_format'] = widget.input_format if hasattr(widget, 'input_format') else ''
                default_initial = ''
            case 'URLInput':
                field_spec['type'] = 'url'
                default_initial = ''
            case 'NumberInput':
                field_spec['type'] = 'number'
            case 'PositiveNumberInput':
                field_spec['type'] = 'positive_number'
            case 'EmailInput':
                field_spec['type'] = 'email'
                default_initial = ''
            case 'DateInput':
                field_spec['type'] = 'date'
                default_initial = ''
            case 'Textarea':
                field_spec['type'] = 'textarea'
                default_initial = ''
            case 'CheckboxInput':
                field_spec['type'] = 'checkbox'
                field_spec['label_hint'] = str(field.label)
                if not field.label and hasattr(widget, 'label_hint') and widget.label_hint:
                    field_spec['label_hint'] = str(widget.label_hint)
                # TODO widget.attrs['checked'] (bool) ??? but initial is enough basically
            case 'HiddenInput':
                field_spec['type'] = 'hidden'
                field_spec['label'] = ''
                default_initial = ''
            case 'Select':
                field_spec['type'] = 'select'
                field_spec['choices'] = widget.choices
            case 'RadioSelect':
                field_spec['type'] = 'radio'
                field_spec['choices'] = widget.choices
            case 'ClearableFileInput':
                field_spec['type'] = 'image'
                field_spec['checkbox_name'] = widget.clear_checkbox_name(name)
                field_spec['checkbox_id'] = widget.clear_checkbox_id(name)
            case 'CroppedImageInput':
                field_spec['type'] = 'image'
                field_spec['checkbox_name'] = widget.clear_checkbox_name(name)
                field_spec['checkbox_id'] = widget.clear_checkbox_id(name)
                if isinstance(field_spec['initial'], ImageFieldFile):
                    field_spec['initial'] = transform_image_field_file(field_spec['initial'])
                field_spec['expected_width'] = widget.expected_width
                field_spec['expected_height'] = widget.expected_height
            case 'CaptchaInput':
                field_spec['type'] = 'captcha'
                default_initial = ''
            case _:
                raise ValueError(f'Unknown widget type: {widget_name}')

        # null is a bad initial value for react-hook-form
        # it consider an empty input with required=False as invalid if it has initial=null
        if field_spec['initial'] is None and default_initial is not None:
            field_spec['initial'] = default_initial

        # TODO widget.is_hidden ???
        if widget_name == 'HiddenInput':
            hidden_fields.append(name)

        fields[name] = field_spec

    # Fieldsets
    fieldsets = _get_fieldsets_spec(helper, fields)

    # building a result spec
    spec = FormSpec(
        id=helper.form_id,
        action=helper.action, method=helper.method, enctype=helper.enctype,
        button_text=helper.button_text,
        fields=fields,
        hidden_fields=hidden_fields,
        fieldsets=fieldsets,
        conditional_logic=helper.conditional_logic,
        i18n_phrases=helper.i18n_phrases,
    )

    value = {}  # TODO remove ???
    data = FormData(value=value)  # TODO remove ???

    form_state = FormState(
        spec=spec,
        data=data,  # TODO remove ???
        debug_enabled=helper.debug_enabled
    )

    form.helper.spec = form_state  # caching
    return form_state


def _get_fieldsets_spec(meta: Helper, fields_spec: FieldSpecsDict) -> FieldsetSpecList:
    fieldsets: FieldsetSpecList = []

    if hasattr(meta, 'fieldsets') and len(meta.fieldsets):
        for fieldset_spec in meta.fieldsets:
            fieldset: FieldsetSpec = {}
            if 'title' in fieldset_spec:
                fieldset['title'] = str(fieldset_spec['title'])
            if 'desc' in fieldset_spec:
                fieldset['desc'] = fieldset_spec['desc']
            fieldset['fields'] = _transform_fieldset_fields(fieldset_spec['fields'])
            fieldset['css_classes'] = fieldset_spec['css_classes'] if 'css_classes' in fieldset_spec else []
            fieldset['conditional_logic'] = (
                fieldset_spec['conditional_logic'] if 'conditional_logic' in fieldset_spec else []
            )
            fieldsets.append(fieldset)
    else:
        fields: list[str] = []
        for field_name in fields_spec:
            field = fields_spec[field_name]

            # filter hidden fields
            if field['type'] == 'hidden':
                continue
            fields.append(field_name)

        # a form can have hidden fields only
        # so check that we have visible fields in a form to create a minimal fieldset
        if len(fields):
            minimal_fieldset_spec: FieldsetSpec = {'fields': fields}
            fieldsets.append(minimal_fieldset_spec)
    return fieldsets


def _transform_fieldset_fields(fields: list) -> FieldsetFieldList:
    result: FieldsetFieldList = []
    for field in fields:
        # TODO raise if field is not in fields list
        #      it will require to transform get_form_spec() to a class
        if isinstance(field, LayoutItem):
            field_spec = field.to_spec()
        else:
            field_spec = field
        result.append(field_spec)
    return result


def transform_image_field_file(file: ImageFieldFile | None) -> ImageFileInfo:
    data: ImageFileInfo = {
        'exists': False,
        'url': '',
    }
    if file and file.name:
        data['exists'] = True
        data['url'] = file.url
    return data


def _get_str_length_validator(field: BoundField, name: str) -> ValidatorSpec:
    if name not in ['min_length', 'max_length']:
        raise ValueError(f'incorrect name: {name}')
    return {
        'name': 'max_length',
        'type': 'max_length',
        'value': getattr(field, name),
        'inverse': False,
        'allow_empty': False,
        'message': '',
    }


def prepare_regexp_validator(validator: RegexValidator, allow_empty: bool = False,
                             inverse: bool = False) -> ValidatorSpec:
    result: ValidatorSpec = {
        'type': 'regexp',
        'name': validator.code,
        'value': validator.regex,
        'allow_empty': allow_empty,
        'inverse': inverse,
        'message': validator.message,
    }
    return result
