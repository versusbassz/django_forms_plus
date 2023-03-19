from datetime import datetime

from django.http import HttpRequest, JsonResponse
from django.views.generic import FormView

from django_forms_plus import (
    DfpViewMixin,
    json_success_response, json_fail_response, message_result_action)
from ..forms import ContactsForm
from ..misc import AddFormDebugForViewMixin


__all__ = [
    'ContactsView',
]


class ContactsView(DfpViewMixin, AddFormDebugForViewMixin, FormView):
    template_name = 'blog_react/form.html'
    form_class = ContactsForm
    x_page_title = 'Contacts form - React'

    def post(self, request: HttpRequest, *args, **kwargs) -> JsonResponse:
        form = ContactsForm(request.POST)
        if form.is_valid():
            msg = f'Форма успешно отправлена - {datetime.utcnow()}'
            return json_success_response(action=message_result_action(msg))
        else:
            return json_fail_response(form)
