from django.urls import path, re_path
from django.views.generic.base import RedirectView

from . import views


urlpatterns = [
    path('', views.homepage, name='homepage'),
    path('success/', views.success, name='success'),
]

# Favicon
favicon_view = RedirectView.as_view(url='/static/favicon.ico', permanent=True)
urlpatterns += [
    re_path(r'^favicon\.ico$', favicon_view),
]
