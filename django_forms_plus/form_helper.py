from django.shortcuts import reverse


__all__ = [
    'Helper',
]


class Helper(object):
    def __init__(self, form):
        self.spec = None
        self.debug_enabled = False

        meta = form.DfpMeta if hasattr(form, 'DfpMeta') else _EmptyMeta

        # TODO None is necessary for sub-forms in a compound form
        #      but where to check that form_id is set for a simple form ???
        #      during a spec generation ???
        self.form_id = meta.form_id if hasattr(meta, 'form_id') else None

        self.action = reverse(meta.action) if hasattr(meta, 'action') and meta.action else ''
        self.method = meta.method if hasattr(meta, 'method') else 'post'
        self.enctype = meta.enctype if hasattr(meta, 'enctype') else 'application/x-www-form-urlencoded'  # noqa: E503

        self.fieldsets = meta.fieldsets if hasattr(meta, 'fieldsets') else []

        self.conditional_logic = {**meta.conditional_logic} if hasattr(meta, 'conditional_logic') else {}  # noqa: E503

        self.error_messages = {**meta.error_messages} if hasattr(meta, 'error_messages') else {}
        self.global_error_messages = {**meta.global_error_messages} if hasattr(meta, 'global_error_messages') else {}  # noqa: E503
        self.validators = {**meta.validators} if hasattr(meta, 'validators') else {}
        self.soft_validators = {**meta.soft_validators} if hasattr(meta, 'soft_validators') else {}

        self.button_text = str(meta.button_text) if hasattr(meta, 'button_text') else 'Send'

        self.i18n_phrases = {**meta.i18n_phrases} if hasattr(meta, 'i18n_phrases') else {}


class _EmptyMeta:
    """Used in Helper when a Form doesn't have a defined DfpMeta class"""
    pass
