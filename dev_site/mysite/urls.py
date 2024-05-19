"""
The root URLconf

see https://docs.djangoproject.com/en/3.2/topics/http/urls/
"""
from django.contrib import admin
from django.urls import path, include


urlpatterns = [
    path('', include('apex.urls')),
    path('blog_old/',   include(('blog_old.urls', 'blog_old'),     namespace='blog_old')),
    path('blog_react/', include(('blog_react.urls', 'blog_react'), namespace='blog_react')),
    path('admin/', admin.site.urls),
]
