from django.db import models
from django.contrib.auth.models import User

class CulturalSite(models.Model):
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=100, blank=True, null=True)   
    tourism = models.CharField(max_length=100, blank=True, null=True)
    amenity = models.CharField(max_length=100, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    postcode = models.CharField(max_length=20, blank=True, null=True)
    street = models.CharField(max_length=200, blank=True, null=True)
    district = models.CharField(max_length=100, blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    phone = models.CharField(max_length=40, blank=True, null=True)
    image = models.URLField(blank=True, null=True)
    lat = models.FloatField()
    lng = models.FloatField()

    def __str__(self):
        return f"{self.name} ({self.category or self.tourism or self.amenity})"

class SavedPlace(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saved_places')
    name = models.CharField(max_length=255)
    tourism = models.CharField(max_length=100, null=True, blank=True)
    amenity = models.CharField(max_length=100, null=True, blank=True)
    city = models.CharField(max_length=100, null=True, blank=True)   
    postcode = models.CharField(max_length=20, null=True, blank=True)
    street = models.CharField(max_length=200, null=True, blank=True)
    district = models.CharField(max_length=100, null=True, blank=True)
    website = models.URLField(null=True, blank=True)
    image = models.URLField(null=True, blank=True)
    lat = models.FloatField(null=True, blank=True)
    lng = models.FloatField(null=True, blank=True)

    def __str__(self):
        return f"{self.name} ({self.tourism or self.amenity})"

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    gender = models.CharField(max_length=10, blank=True)
    dob = models.DateField(blank=True, null=True)
    country = models.CharField(max_length=100, blank=True)
    profile_image = models.ImageField(upload_to='avatars/', blank=True, null=True)

    def __str__(self):
        return self.user.username

class VisitedPlace(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='visited_places')
    place_id = models.IntegerField()  
    name = models.CharField(max_length=255)
    tourism = models.CharField(max_length=100, null=True, blank=True)
    amenity = models.CharField(max_length=100, null=True, blank=True)   
    city = models.CharField(max_length=100, null=True, blank=True)
    postcode = models.CharField(max_length=20, null=True, blank=True)
    street = models.CharField(max_length=200, null=True, blank=True)
    district = models.CharField(max_length=100, null=True, blank=True)
    website = models.URLField(null=True, blank=True)
    image = models.URLField(null=True, blank=True)
    lat = models.FloatField(null=True, blank=True)
    lng = models.FloatField(null=True, blank=True)
    date_visited = models.DateTimeField(auto_now_add=True)
    def average_rating(self):
        reviews = self.review_set.all()
        if reviews.exists():
            return round(reviews.aggregate(models.Avg('rating'))['rating__avg'], 2)
        return None

    def review_count(self):
        return self.review_set.count()
    def __str__(self):
        return f"{self.name} (visited by {self.user.username})"

class Review(models.Model):
    visited_place = models.OneToOneField(VisitedPlace, on_delete=models.CASCADE, related_name='review')
    rating = models.IntegerField()
    text = models.TextField(blank=True)
    reviewed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review {self.rating} for {self.visited_place}"


class District(models.Model):
    name = models.CharField(max_length=255)
    city = models.CharField(max_length=100, blank=True, null=True)
    postcode = models.CharField(max_length=20, blank=True, null=True)
    lat = models.FloatField(blank=True, null=True)
    lng = models.FloatField(blank=True, null=True)

    def __str__(self):
        return f"{self.name} ({self.city})"
