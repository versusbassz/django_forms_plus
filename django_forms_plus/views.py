from django.apps import apps
from django.http import HttpRequest
from django.middleware.csrf import get_token
from django.views.generic.edit import FormMixin
from django.utils.html import mark_safe

from django.contrib.staticfiles.storage import staticfiles_storage

from .types import DjangoForm, FormState
from .spec import get_form_spec


def get_form_layout(form: DjangoForm, request: HttpRequest) -> str:
    form_state = get_form_spec(form)
    csrf_token = get_token(request)
    layout = get_form_layout_raw(form_state, csrf_token)
    return layout


def get_form_layout_raw(form_state: FormState, csrf_token: str | None = None) -> str:
    """Renders a form placeholder with all necessary data for its rendering"""
    form_state_json = form_state.json()
    _form_state = form_state_json
    _csrf_token = csrf_token
    js_script_url = _get_static_file_url('django_forms_plus/dfp.build.js')
    layout = f"""

<div class="js-dj-form-wrapper dfp-form-container">
    <div style="display: none !important;">
        <pre class="js-dj-form__data">{_form_state}</pre>
        <pre class="js-csrf-token">{_csrf_token}</pre>
        <script src="{js_script_url}" async></script>
    </div>

    <div class="js-dj-form">
        <div class="dfp-preloader-wrapper"><div class="dfp-preloader"></div></div>
    </div>
</div>

"""
    return mark_safe(layout)


def _get_static_file_url(path: str):
    """
    Fetches a URL of a static file from a configured "django.contrib.staticfiles" app.
    see: django.templatetags.static.StaticNode.handle_simple
    """
    if apps.is_installed("django.contrib.staticfiles"):
        return staticfiles_storage.url(path)
    else:
        raise RuntimeError('The auto-loading of static files in "django_forms_plus" app depends on'
                           ' "django.contrib.staticfiles" app. Please, enable and configure it.')
        # return urljoin(PrefixNode.handle_simple("STATIC_URL"), quote(path))


class AttachRequestToFormMixin:
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        context['form'].request = self.request
        return context


class SimpleDfpViewMixin:
    """
    Dumb but does its job. Just inserts a form to a context.
    Use in TemplateView.
    DONT USE IT IN ANY FORM-MIXIN VIEW
    """
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        form = self.get_form()
        form.request = self.request
        context['form'] = form

        return context


class EditDfpViewMixin(AttachRequestToFormMixin):
    """
    Use it with CreateView, UpdateView
    """
    pass


class DfpViewMixin(SimpleDfpViewMixin, FormMixin):
    form_valid = None
    form_invalid = None
    get_success_url = None
