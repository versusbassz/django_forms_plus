from django.core.exceptions import ValidationError


class FailCaptchaMixin:
    def clean_captcha(self):
        captcha = self.cleaned_data['captcha']
        if 'a' not in captcha:
            raise ValidationError('Wrong Captcha', 'sample_code')
        return captcha
