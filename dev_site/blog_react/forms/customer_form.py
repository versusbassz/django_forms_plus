from django import forms

from apex.models import Customer, PrivateData
from django_forms_plus import DfpFormMixin, CompositeForm


__all__ = [
    'CustomerAddForm',
    'CustomerChangeForm',
    'CustomerChangeCompositeForm',
]


_conditional_logic = {
    'version': 1,
    'rules': {
        'middle_name': [
            [
                {
                    'field': 'has_middle_name',
                    'operator': 'checked',
                },
            ],
        ],
    },
}


class CustomerAddForm(DfpFormMixin, forms.ModelForm):
    class Meta:
        model = Customer
        fields = ['email', 'first_name', 'has_middle_name', 'middle_name', 'last_name']
        widgets = {
            'middle_name': forms.TextInput(attrs={'placeholder': 'ph - Meta - middle_name'})
        }

    class DfpMeta:
        form_id = 'customer_add'
        action = 'blog_react:customer_add'
        method = 'post'
        placeholders = {
            'last_name': 'ph - DpfMeta - last_name',
        }
        conditional_logic = _conditional_logic


class CustomerChangeForm(DfpFormMixin, forms.ModelForm):
    class Meta:
        model = Customer
        fields = ['email', 'first_name', 'has_middle_name', 'middle_name', 'last_name']
        widgets = {
            'email': forms.EmailInput(attrs={'readonly': True})
        }

    class DfpMeta:
        form_id = 'customer_change'
        action = ''  # 'blog_react:customer_change' + arg:pk
        method = 'post'
        placeholders = {
            'last_name': 'ph - DpfMeta - last_name',
        }
        conditional_logic = _conditional_logic


class PrivateDataChangeForm(DfpFormMixin, forms.ModelForm):
    class Meta:
        model = PrivateData
        fields = ['age', 'vat']

    class DfpMeta:
        form_id = 'private_data_change'


class CustomerChangeCompositeForm(CompositeForm):
    forms_classes = {
        'customer': CustomerChangeForm,
        'private_data': PrivateDataChangeForm,
    }

    def get_instances(self, target_instance):
        return {
            'customer': target_instance,
            'private_data': PrivateData.objects.get(customer=target_instance),
        }

    class DfpMeta:
        form_id = 'customer_change_composite_form'
