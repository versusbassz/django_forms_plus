from django.urls import path

from . import views


urlpatterns = [
    path('reset-pwd/', views.reset_pwd, name='reset_pwd_page'),
    path('reset-pwd/handle/', views.handle_reset_pwd, name='reset_pwd_handle'),
]
