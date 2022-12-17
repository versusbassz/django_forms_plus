from django.shortcuts import render
from django.http import HttpRequest, HttpResponse


def homepage(request: HttpRequest, *args, **kwargs):
    return render(request, 'apex/index.html')


def success(request: HttpRequest, *args, **kwargs):
    return HttpResponse('<h1>Sent successfully.</h1>')
