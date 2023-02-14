from django.db.models.fields.files import ImageFieldFile

from .types import DjangoForm, FormState, FormSpec, FormData
from .errors import get_global_error_messages, get_error_message
from .layout import LayoutItem


def get_form_spec(form: DjangoForm) -> FormState:
    if form.helper.spec is not None:  # caching
        # TODO probably, it's better to move the building logic
        #      to a separate build_form_spec() function and keep caching logic here
        # TODO do we need to clear the cache somehow ??? (an func argument / method of an object)
        return form.helper.spec

    helper = form.helper

    # we need to process bound fields to act closely to the original Django forms logic
    # see django.forms.forms.BaseForm.__iter__
    #     (it's an entry point during rendering forms in templates)
    bound_fields = {f_name: form[f_name] for f_name in form.fields}

    fields = {}
    hidden_fields = []
    for name, bound_field in bound_fields.items():
        field = bound_field.field
        widget = bound_field.field.widget
        widget_type = type(widget)
        field_spec = {
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
        has_custom_validators = hasattr(helper, 'validators')
        field_name = field.dfp_field_name if hasattr(field, 'dfp_field_name') else type(field).__name__
        match field_name:
            case 'CharField':
                if hasattr(field, 'max_length') and field.max_length:
                    field_spec['validators'].append({'name': 'max_length', 'type': 'max_length',
                                                     'value': field.max_length})
                if hasattr(field, 'min_length') and field.min_length:
                    field_spec['validators'].append({'name': 'min_length', 'type': 'min_length',
                                                     'value': field.min_length})

        if has_custom_validators and name in helper.validators:
            for validator in helper.validators[name]:
                if validator['name'] == 'required':
                    raise ValueError('"required" prop must not be set via DfpMeta.validators. '
                                     'Set it on a Form\'s Field itself')

                cur_validator = {
                    'name': validator['name'],
                    'type': validator['type'] if 'type' in validator else validator['name'],
                    'value': validator['value'],
                    'inverse': validator['inverse'] if 'inverse' in validator else False,
                    'message': str(validator['message']) if 'message' in validator else None,
                }
                field_spec['validators'].append(cur_validator)

                if cur_validator['message'] is None:
                    # TODO move this error_messages logic to its main part
                    error_value = get_error_message(name, validator['name'], helper, global_messages)
                    field_spec['errors'][validator['name']] = str(error_value)

        # Soft validators
        field_spec['soft_validators'] = []
        has_soft_validators = hasattr(helper, 'soft_validators') and name in helper.soft_validators
        if has_soft_validators:
            for validator in helper.soft_validators[name]:
                field_spec['soft_validators'].append({
                    'name': validator['name'],
                    'type': validator['type'] if 'type' in validator else validator['name'],
                    'value': validator['value'] if 'value' in validator else None,
                    'inverse': validator['inverse'] if 'inverse' in validator else False,
                    'message': str(validator['message']),  # a message is required for now
                })

        # attr: type  + specific settings
        widget_name = widget_type.__name__
        match widget_name:
            case 'SlugInput':
                field_spec['type'] = 'slug'
                field_spec['prefix'] = widget.prefix if hasattr(widget, 'prefix') else ''
                field_spec['suggestions'] = widget.suggestions
                default_initial = ''
            case 'TextInput':
                field_spec['type'] = 'text'
                default_initial = ''
            case 'NumberInput':
                field_spec['type'] = 'number'
            case 'EmailInput':
                field_spec['type'] = 'email'
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
                raise ValueError(f'Unknown widget type: {widget_type.__name__}')

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


def _get_fieldsets_spec(meta, fields_spec: dict) -> list:
    if hasattr(meta, 'fieldsets') and len(meta.fieldsets):
        fieldsets = []
        for fieldset_spec in meta.fieldsets:
            fieldset = {}
            if 'title' in fieldset_spec:
                fieldset['title'] = fieldset_spec['title']
            if 'desc' in fieldset_spec:
                fieldset['desc'] = fieldset_spec['desc']
            fieldset['fields'] = _transform_fieldset_fields(fieldset_spec['fields'])
            fieldset['css_classes'] = fieldset_spec['css_classes'] if 'css_classes' in fieldset_spec else []  # noqa: E503
            fieldsets.append(fieldset)
    else:
        fieldsets = [
            {
                'fields': [field for index, field in enumerate(fields_spec)]
            },
        ]
    return fieldsets


def _transform_fieldset_fields(fields: list) -> list:
    result = []
    for field in fields:
        if isinstance(field, LayoutItem):
            field_spec = field.to_spec()
        else:
            field_spec = field
        result.append(field_spec)
    return result


def transform_image_field_file(file: ImageFieldFile | None) -> dict:
    data = {
        'exists': False,
        'url': '',
    }
    if file and file.name:
        data['exists'] = True
        data['url'] = file.url
    return data
