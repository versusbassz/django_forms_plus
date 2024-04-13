# Form.DfpMeta specification

The short example:
```python
from django import forms

class MyForm(forms.Form):
    email = forms.EmailField()
    
    class DfpMeta:
        form_id = 'my_form'
        action = 'my_form_handler_view'  
        button_text = 'Confirm'
```

### Attributes

`form_id` - `str`. Required. A unique form id.

`action` - `str`. Optional, default: `''` (a form submits data to the same URL).
                    A route name for `reverse()`

`method` - `str`. Optional, default: `POST`. `attr:action` (HTTP-method) of a rendered HTML-form.

`enctype` - `str`. Optional, default: `application/x-www-form-urlencoded`. `attr:enctype` of a form.

`button_text` - Optional, default: `'Send'`.

`fieldsets` - `list[dict]`. Optional, default: build dynamically from a list of fields.

`error_messages` - `dict`. Optional, default: `{}`. Error messages, specific for each field.

`global_error_messages` - `dict`. Optional, default: `{}`.
Error messages, are used if a field doesn't have its own message for a certain error type.

`css_classes` - `dict`. Optional, default: the default CSS-classes of `django_forms_plus` app. TODO link

`soft_validators` - TODO

## Layout parts

### ExternalHtml
Trims `innerHTML` of a found block.
If block not found or its `innerHTML === ''`  --> don't output anything.

```python
from django_forms_plus import ExternalHtml

ExternalHtml(
    selector='.my-external-html-block',  # required
    warn_if_not_found=False,  # Default: True. Do console.warn() if a block not found
)
```


## Fieldsets

```python
fieldsets = [
    {
        'title': 'Fieldset title',
        'desc': 'The example of a fieldset description.',
        'fields': ['field_1', 'field_2', 'field_3'],
        'css_classes': ['css-class-1', 'css-class-2'],
     },
]
```

If no fieldsets are provided in `DfpMeta`, DFP creates just one fieldset with only `fields` key.

```python
fieldsets = [
    {
        'fields': ['field_1', 'field_2', 'field_3'],
    },
]
```

