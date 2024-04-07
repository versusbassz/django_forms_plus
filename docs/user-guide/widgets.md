## Base moments

```python
django.core.validators.EMPTY_VALUES = (None, '', [], (), {})

```




## Date

`django.forms.widgets.DateInput`  
https://docs.djangoproject.com/en/3.2/ref/forms/widgets/#dateinput
MRO: `DateTimeBaseInput -> TextInput -> Input -> Widget -> M::MediaDefiningClass`
attrs: `format` (%-like datetime syntax)
```python
class DateInput(DateTimeBaseInput):
    format_key = 'DATE_INPUT_FORMATS'
    template_name = 'django/forms/widgets/date.html'

    input_type: 'text'  # from TextInput
```

`django.forms.fields.DateField`  
https://docs.djangoproject.com/en/3.2/ref/forms/fields/#datefield
MRO: `BaseTemporalField -> Field`
attrs: `input_formats`
    `ISO_INPUT_FORMATS . DATE_INPUT_FORMATS: ['%Y-%m-%d']`


`django.db.models.fields.DateField`  
https://docs.djangoproject.com/en/3.2/ref/models/fields/#datefield  
MRO:  `DateTimeCheckMixin -> Field -> RegisterLookupMixin`  
python type: `datetime.date`


also see all `DATE*` settings: https://docs.djangoproject.com/en/3.2/ref/settings/#date-format


## Image

"initial" value for ImageField is `ImageFieldFile` (not json-serializable, has to be serialized manually)

`form.cleaned_data` contains an uploading file as `django.core.files.uploadedfile.InMemoryUploadedFile`

if a file is being removed via the default checkbox -> `form.cleaned_data` contains `False`, so you need to check a type of a form field to produce a payload for ModelForm

see MDN for input:file


"Clear" checkbox

The handling logic in:
1. `django.forms.widgets.ClearableFileInput.value_from_datadict` used in `BaseForm.full_clean()`
2. `django.forms.fields.FileField.clean` used in `BaseForm.full_clean()`
3. `django.db.models.fields.files.FileField.save_form_data`  used in `django.forms.models.construct_instance` which also is a late part of `BaseForm.full_clean()`  (see for details `django.forms.models.BaseModelForm._post_clean`)


files in Django: `django.core.files`  
https://docs.djangoproject.com/en/3.2/topics/files/
https://docs.djangoproject.com/en/3.2/ref/files/

TODO: when a file is moved to its final location? during Model.save() ?
