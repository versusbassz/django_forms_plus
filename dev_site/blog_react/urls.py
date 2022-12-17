from django.urls import path

from . import views


urlpatterns = [
    # path('contacts/', views.contacts_view, name='reset_pwd_page'),
    # path('contacts/handle/', views.contacts_form_handle, name='contacts_handle'),

    path('contacts/', views.ContactsView.as_view(), name='contacts_page'),

    path('profile/list/', views.ProfileListView.as_view(), name='profile_list'),
    path('profile/add/', views.ProfileAddView.as_view(), name='profile_add'),
    path('profile/change/<int:pk>/', views.ProfileChangeView.as_view(), name='profile_change'),
    path('profile/delete/<int:pk>/', views.ProfileDeleteView.as_view(), name='profile_delete'),

    path('customer/list/', views.CustomerListView.as_view(), name='customer_list'),
    path('customer/add/', views.CustomerAddView.as_view(), name='customer_add'),
    path('customer/change/<int:pk>/', views.CustomerChangeView.as_view(), name='customer_change'),
    path('customer/delete/<int:pk>/', views.CustomerDeleteView.as_view(), name='customer_delete'),
]
