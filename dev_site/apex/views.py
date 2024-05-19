from django.shortcuts import render
from django.http import HttpRequest, HttpResponse


def homepage(request: HttpRequest, *args, **kwargs):
    context = {
        'title': 'Homepage',
    }
    return render(request, 'apex/index.html', context=context)


def success(request: HttpRequest, *args, **kwargs):
    return HttpResponse('<h1>Sent successfully.</h1>')
