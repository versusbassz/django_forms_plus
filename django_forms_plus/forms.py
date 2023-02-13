from copy import deepcopy
from datetime import datetime

from .views import get_form_layout
from .form_helper import Helper


__all__ = [
    'DfpFormMixin',
    'CompositeForm',
]


class _HelperMixin:
    def _init_helper(self):
        self.helper = build_helper(form=self)
        self.change_helper(self.helper)

    def change_helper(self, helper: Helper) -> None:
        pass


class _HtmlMixin:
    def html(self):
        return get_form_layout(self, request=self.request)


class DfpFormMixin(_HtmlMixin, _HelperMixin):
    def __str__(self):
        raise RuntimeError('DONT print "django_forms_plus" forms directly! Use .html() method')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._init_helper()

    # init_helper()

    # change_helper()

    # html()


class CompositeForm(_HtmlMixin, _HelperMixin):
    forms_classes: dict | None = None

    def __init__(self, *args, **kwargs):
        self.sub_forms = []
        self.fields = {}
        self.initial = {}
        self.errors = {}

        self.init_forms(*args, **kwargs)
        self._init_helper()
        pass

    # init_helper()

    # change_helper()

    def init_forms(self, *args, **kwargs):
        _kwargs = deepcopy(kwargs)
        # _data =

        if 'prefix' in _kwargs:
            del _kwargs['prefix']

        if self.forms_classes is None:
            raise ValueError('CompositeForm::forms_classes is not set up')

        # model instances
        has_instance = 'instance' in _kwargs and _kwargs['instance'] is not None
        target_instance = _kwargs['instance'] if has_instance else None
        instances = self.get_instances(target_instance) if has_instance else {}

        if has_instance:
            del _kwargs['instance']

        # init sub_forms
        for prefix, form_class in self.forms_classes.items():
            form = form_class(prefix=prefix, instance=instances[prefix], *args, **_kwargs)
            self.sub_forms.append(form)

        # merge necessary data from sub_forms
        for form in self.sub_forms:
            prefix = form.prefix
            for name, field in form.fields.items():
                key = f'{prefix}-{name}'

                # self.fields
                self.fields[key] = field

                # self.initial
                if name in form.initial:
                    self.initial[key] = form.initial[name]

    def get_instances(self, target_instance):
        raise NotImplemented('CompositeForm.get_instances() method must be implemented')

    # html()

    def is_valid(self):
        results = []
        for form in self.sub_forms:
            results.append(form.is_valid())
        return all(results)


def build_helper(form):
    if isinstance(form, CompositeForm):
        root_helper = Helper(form)
        sub_helpers = [Helper(sub_form) for sub_form in form.sub_forms]

        result_helper = _merge_helpers(root_helper, sub_helpers)
        result_helper.sub_helpers = sub_helpers
        return result_helper
    else:
        return Helper(form)


def _merge_helpers(root: Helper, sub: list[Helper]) -> Helper:
    # form_id - from root

    # action - from root
    # method - from root
    # enctype - from root

    # TODO merge form.fields

    return root
