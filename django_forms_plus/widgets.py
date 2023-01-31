from django import forms


class DumbInput(forms.TextInput):
    pass


class CaptchaInput(DumbInput):
    pass


class SlugInput(forms.TextInput):
    dfp_field = True

    def __init__(self, prefix: str = '', suggestions: list | None = None, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.prefix = prefix
        self.suggestions = suggestions if suggestions is not None else []


class CheckboxInput(forms.CheckboxInput):
    """
    Attributes:
        label_hint - a text near the input (self.label is used in the text above the input)
    """
    dfp_field = True  # experimental, not used yet

    def __init__(self, label_hint=None, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.label_hint = label_hint if label_hint else ''


class ClearableFileInput(forms.ClearableFileInput):
    """
    Allows set clear_checkbox_label in the constructor.
    The original parent class uses a static attribute.
    """
    dfp_field = True

    def __init__(self, clear_checkbox_label: str | None = None, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if clear_checkbox_label is not None:
            self.clear_checkbox_label = clear_checkbox_label


class CroppedImageInput(ClearableFileInput):
    """
    Allows set expected width/height of a image.
    """
    dfp_field = True

    def __init__(self, expected_width: int, expected_height: int, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.expected_width = expected_width
        self.expected_height = expected_height
