# Composite forms

## Restrictions
- it only works for the case when you have one target Model instance (usually inside `UpdateView`)
and several related (one-to-one relations usually)

```python
from django.contrib.auth import get_user_model
from django import forms
from django_forms_plus import CompositeForm

UserModel = get_user_model()


class AuthorSubForm(forms.ModelForm):
    class Meta:
        model = Author
        fields = ['first_name', 'last_name']

class AuthorPrivateData(forms.ModelForm):
    class Meta:
        model = AuthorPrivateData
        fields = ['passport_id', 'vat']
        

class AuthorContactsCompositeForm(CompositeForm):
    forms_classes = {
        'author': AuthorPrivateData,
        'private_data': AuthorPrivateData,
    }

    def get_instances(self, target_instance: UserModel):
        return {
            'user': target_instance,
            'profile': AuthorPrivateData.objects.get(author=target_instance),
        }
    
    class DfpMeta:
        ...
```
