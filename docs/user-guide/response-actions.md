# Response actions

## Action types

Use `django_forms_plus.FormResponseAction` to build an action data in a response.  
It's imported like this `from django_forms_plus import FormResponseAction`.

The default action type is `message`.

### message

```python
FormResponseAction(
    type='message', 
    meta={'message': 'Form saved!'},
)
```

### message (external)

If you want to display a custom HTML layout instead of the default message layout, do it like this:

```python
FormResponseAction(
    type='message',
    meta={
        'external_block': external_block,
    },
)
```

and place similar HTML code in a template where a form is rendered

```html
<div class="js-custom_msg_layout" style="display: none;">
    <h1>My custom success message</h1>
</div>
```


### url

```python
FormResponseAction(
    type='url', 
    meta={'url': 'https://example.com/'},
)
```


### custom

```python
FormResponseAction(
    type='custom', 
    meta={},  # whatever you need
)
```

See `js-api.md` to read how to handle `dfp:custom_action` action.


## How to use Response Actions in Model Views

```python
from django.views.generic import DetailView
from django_forms_plus import (EditDfpViewMixin,
                               json_success_modelform_response, json_fail_response, FormResponseAction)


class MyView(EditDfpViewMixin, DetailView):
    ...
    
    def form_valid(self, form):
        msg = 'Form saved!'

        response = json_success_modelform_response(
            form=form,
            instance=self.object,
            action=FormResponseAction(
                type='message', 
                meta={'message': msg},
            ),
        )
        return response

    def form_invalid(self, form):
        response = json_fail_response(form)
        return response
```
