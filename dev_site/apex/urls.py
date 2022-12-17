from django.urls import path

from . import views


urlpatterns = [
    path('', views.homepage, name='homepage'),
    path('success/', views.success, name='success'),
]
