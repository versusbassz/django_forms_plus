
https://docs.djangoproject.com/en/4.1/topics/forms/modelforms/#overriding-the-default-fields
```python
from django.core.exceptions import NON_FIELD_ERRORS
from django import forms

class MyForm(forms.ModelForm)
    slug = forms.CharField(validators=[validate_slug])  # <-- custom validators here
    # Meta for this field is ignored
    # Fields defined declaratively do not draw their attributes like max_length or required from the corresponding model. 
    # If you want to maintain the behavior specified in the model, 
    # you must set the relevant arguments explicitly when declaring the form field.

    
    class Meta:  # inheritance is possible -    class Meta(ArticleForm.Meta):
        model = MyModel
        exclude = ['title']
        fields = ['name', 'slug']  # or '__all__'
        field_classes = {
            'slug': MySlugFormField,
        }
        widgets = {
            'name': forms.Textarea(attrs={'cols': 80, 'rows': 20}),
        }
        labels = {
            'name': _('Writer'),
        }
        help_texts = {
            'name': _('Some useful help text.'),
        }
        error_messages = {
            'name': {
                'max_length': _("This writer's name is too long."),
            },
            NON_FIELD_ERRORS: {
                'unique_together': "%(model_name)s's %(field_labels)s are not unique.",
            },
        }
        localized_fields = ('birth_date',)  # or '__all__'
```