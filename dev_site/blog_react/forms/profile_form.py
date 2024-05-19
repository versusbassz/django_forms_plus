from django import forms

from apex.models import Profile
from django_forms_plus import DfpFormMixin


__all__ = [
    'ProfileAddForm',
    'ProfileChangeForm',
]


_conditional_logic = {
    'middle_name': [
        [
            {
                'field': 'has_middle_name',
                'operator': 'checked',
            },
        ],
    ],
}


class ProfileAddForm(DfpFormMixin, forms.ModelForm):
    class Meta:
        model = Profile
        fields = ['email', 'first_name', 'has_middle_name', 'middle_name', 'last_name']
        widgets = {
            'middle_name': forms.TextInput(attrs={'placeholder': 'ph - Meta - middle_name'})
        }

    class DfpMeta:
        form_id = 'profile_add'
        action = 'blog_react:profile_add'
        method = 'post'
        placeholders = {
            'last_name': 'ph - DpfMeta - last_name',
        }
        conditional_logic = _conditional_logic


class ProfileChangeForm(DfpFormMixin, forms.ModelForm):
    class Meta:
        model = Profile
        fields = ['email', 'first_name', 'has_middle_name', 'middle_name', 'last_name']
        widgets = {
            'email': forms.EmailInput(attrs={'readonly': True})
        }

    class DfpMeta:
        form_id = 'profile_change'
        action = ''  # 'blog_react:profile_change' + arg:pk
        method = 'post'
        placeholders = {
            'last_name': 'ph - DpfMeta - last_name',
        }
        conditional_logic = _conditional_logic
