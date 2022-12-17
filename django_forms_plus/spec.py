from .types import DjangoForm, FormState, FormSpec, FormData
from .errors import get_global_error_messages, get_error_message
from .layout import LayoutItem


def get_form_spec(form: DjangoForm) -> FormState:
    if form.helper.spec is not None:  # caching
        return form.helper.spec

    helper = form.helper
    helper_has_placeholders = hasattr(helper, 'placeholders')

    fields = {}
    hidden_fields = []
    for name, field in form.fields.items():
        widget = field.widget
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
        global_messages = get_global_error_messages()
        field_spec['errors'] = {}

        error_name = 'required'

        if field_spec[error_name]:
            error_value = get_error_message(name, error_name, helper, global_messages)
            field_spec['errors'][error_name] = error_value

        # attrs
        field_spec['attrs'] = widget.attrs
        # TODO transform maxlength -> validator and remove from attrs ???
        # TODO transform minlength -> validator and remove from attrs ???

        # attr: placeholder (from helper meta)
        if helper_has_placeholders and name in helper.placeholders:
            field_spec['attrs']['placeholder'] = helper.placeholders[name]

        # Validators
        field_spec['validators'] = []
        field_name = type(field).__name__
        match field_name:
            case 'CharField':
                if hasattr(field, 'max_length') and field.max_length:
                    field_spec['validators'].append({'name': 'max_length',
                                                     'value': field.max_length})
                if hasattr(field, 'min_length') and field.min_length:
                    field_spec['validators'].append({'name': 'min_length',
                                                     'value': field.min_length})

        # Soft validators
        has_soft_validators = hasattr(helper, 'soft_validators') and name in helper.soft_validators
        soft_errors = {key: str(value) for key, value in helper.soft_validators[name].items()} \
                      if has_soft_validators else {}
        field_spec['soft_validators'] = [key for key, msg in soft_errors.items()] \
                                        if has_soft_validators else []
        field_spec['soft_errors'] = soft_errors if has_soft_validators else []

        # attr: type
        widget_name = widget_type.__name__
        match widget_name:
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

    value = {}
    data = FormData(value=value)

    form_state = FormState(
        spec=spec,
        data=data,
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
