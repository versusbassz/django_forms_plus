import json
from datetime import datetime

from django.http import HttpRequest, HttpResponse, HttpResponseRedirect, JsonResponse
from django.views.generic import ListView, CreateView, UpdateView, DeleteView
from django import forms
from django.shortcuts import reverse

from django_forms_plus import (JsonFormResponse, FormResponseAction,
                               SimpleDfpViewMixin, DfpViewMixin, EditDfpViewMixin,
                               json_success_response, json_fail_response, FormResponseAction)
from apex.models import Customer, PrivateData
from ..misc import AddFormDebugForViewMixin
from ..forms import CustomerAddForm, CustomerChangeCompositeForm



__all__ = [
    'CustomerListView',
    'CustomerAddView',
    'CustomerChangeView',
    'CustomerDeleteView',
]


class CustomerListView(ListView):
    model = Customer
    template_name = 'blog_react/customer_list.html'


class CustomerAddView(DfpViewMixin, AddFormDebugForViewMixin, CreateView):
    model = Customer
    form_class = CustomerAddForm
    template_name = 'blog_react/form.html'

    x_page_title = 'Add Customer'

    def post(self, request: HttpRequest, *args, **kwargs):
        form = self.form_class(request.POST)
        if form.is_valid():
            object = form.save()

            private_data = PrivateData(customer=object)
            private_data.save()

            response = JsonResponse(JsonFormResponse(
                status='success',
                result_action=FormResponseAction(
                    type='url',
                    meta={
                        'url': reverse('blog_react:customer_list'),
                    }
                ),
            ).dict())
        else:
            response = JsonResponse(JsonFormResponse(
                status='fail',
                errors={
                    'email': 'This email is busy.'
                },
            ).dict())
        return response


class CustomerChangeView(DfpViewMixin, AddFormDebugForViewMixin, UpdateView):
    model = Customer
    form_class = CustomerChangeCompositeForm
    template_name = 'blog_react/form.html'

    x_page_title = 'Change Customer'

    def form_valid(self, form):
        for sub_form in form.sub_forms:
            sub_form.save()
        return json_success_response(action=FormResponseAction(type='message', meta={
            'message': f'Форма успешно отправлена - {datetime.utcnow()}'
        }))

    def form_invalid(self, form):
        form.errors = {'__all__': f'Something went wrong - {datetime.utcnow()}'}
        return json_fail_response(form)


class CustomerDeleteView(DeleteView):
    model = Customer

    # the custom template is used because the target model is in another app
    template_name = 'blog_react/confirm_delete.html'

    def get_success_url(self):
        return reverse('blog_react:customer_list')
