```python
from django import forms
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _

from django_forms_plus import DfpFormMixin


UserModel = get_user_model()


class CreateUserForm(DfpFormMixin, forms.ModelForm):
    class Meta:
        model = UserModel
        fields = ('email', 'first_name')

    class DfpMeta:
        form_id = 'user_add'
        fieldsets = [
            {'title': 'Basics',
             'fields': ['name']},
        ]
        button_text = _('Save changes')

```

```python
from django.views.generic.edit import CreateView

class CreateUserView(EditDfpViewMixin, CreateView):

```
