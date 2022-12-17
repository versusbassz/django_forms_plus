from django.db import models


class Customer(models.Model):
    class Meta:
        app_label = 'apex'

    email = models.EmailField()
    first_name = models.CharField(max_length=50)
    middle_name = models.CharField(max_length=50)
    has_middle_name = models.BooleanField(default=True)
    last_name = models.CharField(max_length=50)


class PrivateData(models.Model):
    vat = models.CharField(max_length=20, default='', blank=True)
    age = models.PositiveIntegerField(null=True, blank=True)
    customer = models.OneToOneField(to=Customer, on_delete=models.CASCADE)
