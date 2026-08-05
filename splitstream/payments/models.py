from django.db import models
from django.conf import settings
from groups.models import Group

class Payment(models.Model):
    group = models.ForeignKey(Group, on_delete=models.CASCADE)
    paid_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete = models.CASCADE, related_name="person_paid")
    paid_to = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete = models.CASCADE, related_name="person_paid_to")
    amount = models.DecimalField(max_digits=10, decimal_places = 2)
    created_at = models.DateTimeField(auto_now_add=True)