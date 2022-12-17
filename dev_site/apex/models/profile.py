from django.db import models


class Profile(models.Model):
    class Meta:
        app_label = 'apex'

    email = models.EmailField()
    first_name = models.CharField(max_length=50)
    middle_name = models.CharField(max_length=50)
    has_middle_name = models.BooleanField(default=True)
    last_name = models.CharField(max_length=50)
