# Debugging

Set `helper.debug_enabled` to `True`
```python
from django import forms
from django_forms_plus import DfpFormMixin

class ContactsForm(DfpFormMixin, forms.ModelForm):
    # ...
    
    def change_helper(self, helper) -> None:
        helper.debug_enabled = True
```

or add `dfp_debug` query argument to a URL of a page, e.g.: `https://example.org/?dfp_debug`
