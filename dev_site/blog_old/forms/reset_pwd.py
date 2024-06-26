from django import forms

from apex.misc.captcha import FailCaptchaMixin


class ResetPwdForm(FailCaptchaMixin, forms.Form):
    email = forms.EmailField()
    captcha = forms.CharField(min_length=4, required=False)
