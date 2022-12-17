import json
from datetime import datetime

from django.http import HttpRequest, HttpResponse, HttpResponseRedirect, JsonResponse
from django.views.generic import ListView, CreateView, UpdateView, DeleteView
from django import forms
from django.shortcuts import reverse

from django_forms_plus import (JsonFormResponse, FormResponseAction,
                               SimpleDfpViewMixin, DfpViewMixin, EditDfpViewMixin)
from apex.models import Profile
from ..misc import AddFormDebugForViewMixin
from ..forms import ProfileAddForm, ProfileChangeForm


__all__ = [
    'ProfileListView',
    'ProfileAddView',
    'ProfileChangeView',
    'ProfileDeleteView',
]


class ProfileListView(ListView):
    model = Profile
    template_name = 'blog_react/profile_list.html'


class ProfileAddView(DfpViewMixin, AddFormDebugForViewMixin, CreateView):
    model = Profile
    form_class = ProfileAddForm
    template_name = 'blog_react/form.html'

    x_page_title = 'Add Profile'

    def post(self, request: HttpRequest, *args, **kwargs):
        form = self.form_class(request.POST)
        if form.is_valid():
            form.save()
            response = JsonResponse(JsonFormResponse(
                status='success',
                result_action=FormResponseAction(
                    type='url',
                    meta={
                        'url': reverse('blog_react:profile_list'),
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


class ProfileChangeView(DfpViewMixin, AddFormDebugForViewMixin, UpdateView):
    model = Profile
    form_class = ProfileChangeForm
    template_name = 'blog_react/form.html'

    x_page_title = 'Change Profile'

    def post(self, request: HttpRequest, *args, **kwargs):
        self.object = self.get_object()
        form: forms.ModelForm = self.get_form()
        if form.is_valid():
            self.object = form.save()
            response = JsonResponse(JsonFormResponse(
                status='success',
                result_action=FormResponseAction(
                    type='message',
                    meta={
                        'message': f'Форма успешно отправлена - {datetime.utcnow()}',
                    },
                ),
                payload={name: form.cleaned_data[name] for name in form.cleaned_data}
            ).dict())
        else:
            response = JsonResponse(JsonFormResponse(
                status='fail',
                errors={
                    'first_name': 'THe name is not allowed',
                },
            ).dict())
        return response


class ProfileDeleteView(DeleteView):
    model = Profile

    # the custom template is used because the target model is in another app
    template_name = 'blog_react/confirm_delete.html'

    def get_success_url(self):
        return reverse('blog_react:profile_list')
