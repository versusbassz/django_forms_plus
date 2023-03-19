from django import forms
from django_forms_plus import DfpFormMixin, CaptchaInput, ExternalHtml


__all__ = [
    'ContactsForm',
]


class ContactsForm(DfpFormMixin, forms.Form):
    first_name = forms.CharField(
        label='Имя',
        help_text='Введите ваше имя',
        min_length=4,
        max_length=8,
    )
    email = forms.EmailField(
        required=False,
        label='Email-адрес',
        help_text='Введите ваш существующий email-адрес',
    )
    message = forms.CharField(
        widget=forms.Textarea(),
        disabled=True,
        required=False,
        label='Сообщение',
        help_text='',
    )
    captcha = forms.CharField(
        widget=CaptchaInput(),
        min_length=4,
        max_length=4,
        label='Капча',
        help_text='Подтвердите, что вы не бот >:-0',
    )
    enter_pin = forms.BooleanField(label='Do you want to enter pin', required=False)
    pin = forms.CharField(max_length=4, label='PIN-code')

    sample_hidden_1 = forms.CharField(initial='hvalue_1', widget=forms.HiddenInput())
    sample_hidden_2 = forms.CharField(initial='hvalue_2', widget=forms.HiddenInput())

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.is_bound:
            if 'enter_pin' not in self.data or self.data['enter_pin'] is not True:
                self.fields['pin'].required = False

    def clean(self):
        # raise ValidationError('DEV: internal server error')
        return self.cleaned_data

    class DfpMeta:
        form_id = 'contacts_form'
        # action = ''  # blog_react:contacts_handle
        button_text = 'Отправить'
        fieldsets = [
            {'title': 'Контактные данные',
             'desc': 'Пожалуйста, указывайте ваши реальные данные',
             'fields': ['first_name', 'email']},
            {'title': 'Обращение',
             'desc': '',
             'fields': ['message', 'captcha']},
            {'title': 'Conditional logic',
             'desc': '',
             'fields': ['enter_pin', 'pin']},
            {'fields': [ExternalHtml('.js-external-html-1')]},
        ]
        error_messages = {
            'first_name': {
                'required': 'i18n-local-field: Required field.',
            },
        }
        global_error_messages = {
            'required': 'i18n-local-form: Required field.',
        }
        conditional_logic = {
            'version': 1,
            'rules': {
                'pin': [
                    [
                        {
                            'field': 'enter_pin',
                            'operator': 'checked',
                        },
                    ],
                ],
            },
        }
