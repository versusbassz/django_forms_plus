# CSS customization

```python
from django import forms
import django_forms_plus.widgets as dfp_widgets

class Myform(forms.Form):
    class Meta:
        widgets = {
            'my_field': dfp_widgets.RadioSelect(
                css_classes={
                    'fieldslot': 'custom-select',  # applies to .dfp-fieldslot
                    'field': 'custom-select__field',  # applies to .dfp-fieldslot__field
                }
            ),
        }

    class DfpMeta:
        fieldsets = [
            {
                'fields': ['my_field'],
                'css_classes': ['custom-fieldset'],  # applies to .dfp-fieldset
            },
        ]
```
