from django import forms


class DfpInputMixin:
    dfp_field = True  # is experimental, not used yet

    def __init__(self, css_classes: dict | None = None, *args, **kwargs) -> None:
        self.css_classes = css_classes
        super().__init__(*args, **kwargs)


class CaptchaInput(DfpInputMixin, forms.TextInput):
    pass


class FormattedInput(DfpInputMixin, forms.TextInput):
    dfp_widget_name = 'TextInput'

    def __init__(self, input_format: str, attrs: dict | None = None):
        self.input_format = input_format
        super().__init__(attrs=attrs)


class PositiveNumberInput(DfpInputMixin, forms.TextInput):
    pass


class SlugInput(DfpInputMixin, forms.TextInput):
    def __init__(self, prefix: str = '',
                 suggestions: list | None = None,
                 *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.prefix = prefix
        self.suggestions = suggestions if suggestions is not None else []


class DateInput(DfpInputMixin, forms.DateInput):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.attrs['placeholder'] = '__.__.____'


class CheckboxInput(DfpInputMixin, forms.CheckboxInput):
    """
    Attributes:
        label_hint - a text near the input
                     (self.label is used in the text above the input)
    """
    def __init__(self, label_hint=None, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.label_hint = label_hint if label_hint else ''


class Select(DfpInputMixin, forms.Select):
    pass


class RadioSelect(DfpInputMixin, forms.RadioSelect):
    pass


class ClearableFileInput(DfpInputMixin, forms.ClearableFileInput):
    """
    Allows set clear_checkbox_label in the constructor.
    The original parent class uses a static attribute.
    """
    def __init__(self, clear_checkbox_label: str | None = None,
                 *args, **kwargs):
        super().__init__(*args, **kwargs)
        if clear_checkbox_label is not None:
            self.clear_checkbox_label = clear_checkbox_label


class CroppedImageInput(ClearableFileInput):
    """
    Allows set expected width/height of an image.
    """
    def __init__(self, expected_width: int, expected_height: int,
                 *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.expected_width = expected_width
        self.expected_height = expected_height
