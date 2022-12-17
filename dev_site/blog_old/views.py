import json

from django.shortcuts import render, reverse
from django.http import HttpRequest, HttpResponseRedirect
from django.contrib import messages
from django.contrib.messages import get_messages

from .forms import ResetPwdForm


def reset_pwd(request: HttpRequest, *args, **kwargs):
    form = ResetPwdForm()

    form_status = 'empty'
    form_errors = []
    msg_list = [m for m in get_messages(request)]

    from pprint import pprint
    pprint(msg_list)

    if len(msg_list):
        message = msg_list[0]
        if message.level == messages.SUCCESS:
            form_status = 'success'
        else:
            form_errors = json.loads(message.message).items()
            form_status = 'fail'

    return render(request, 'blog/index.html', {
        'title': 'Reset pwd - Django templates',
        'form': form,
        'form_errors': form_errors,
        'form_status': form_status,
    })


def handle_reset_pwd(request: HttpRequest, *args, **kwargs):
    form = ResetPwdForm(request.POST)

    if form.is_valid():
        messages.success(request, 'The restore link has been sent to your email address')
        return HttpResponseRedirect(reverse('blog_old:reset_pwd_page'), status=303)
    else:
        messages.error(request, json.dumps(form.errors))
        return HttpResponseRedirect(reverse('blog_old:reset_pwd_page'), status=303)
