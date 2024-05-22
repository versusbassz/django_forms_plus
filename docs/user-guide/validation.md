# Validation

`max_length` and `min_length` attributes of `django.db.models.fields.Field` descendants
are transformed to `maxlength / minlength` HTML-attributes.

If a field is 'disabled' initially on backend, so it isn't validated on frontend at all.
