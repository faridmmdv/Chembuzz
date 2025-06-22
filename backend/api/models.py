from django.db import models
from django.contrib.auth.models import User

class SavedPlace(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saved_places')
    name = models.CharField(max_length=255)
    tourism = models.CharField(max_length=100, null=True, blank=True)
    city = models.CharField(max_length=100, null=True, blank=True)
    postcode = models.CharField(max_length=20, null=True, blank=True)
    street = models.CharField(max_length=200, null=True, blank=True)
    district = models.CharField(max_length=100, null=True, blank=True)
    website = models.URLField(null=True, blank=True)
    image = models.URLField(null=True, blank=True)

    def __str__(self):
        return f"{self.name} ({self.tourism})"

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    gender = models.CharField(max_length=10, blank=True)
    dob = models.DateField(blank=True, null=True)
    country = models.CharField(max_length=100, blank=True)
    profile_image = models.ImageField(upload_to='avatars/', blank=True, null=True)

    def __str__(self):
        return self.user.username
