from django import forms


class DumbInput(forms.TextInput):
    pass


class CaptchaInput(DumbInput):
    pass


class CheckboxInput(forms.CheckboxInput):
    """
    Attributes:
        label_hint - a text near the input (self.label is used in the text above the input)
    """
    dfp_field = True  # experimental, not used yet

    def __init__(self, label_hint='None', *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.label_hint = label_hint if label_hint else ''
