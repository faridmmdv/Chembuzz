from django.contrib.auth.models import User
from rest_framework import serializers
from .models import SavedPlace, Profile

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    gender = serializers.CharField(write_only=True, required=False)
    dob = serializers.DateField(write_only=True, required=False)
    country = serializers.CharField(write_only=True, required=False)
    profile_image = serializers.ImageField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'gender', 'dob', 'country', 'profile_image']

    def create(self, validated_data):
        gender = validated_data.pop('gender', '')
        dob = validated_data.pop('dob', None)
        country = validated_data.pop('country', '')
        image = validated_data.pop('profile_image', None)

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email'),
            password=validated_data['password']
        )

        profile, _ = Profile.objects.get_or_create(user=user)
        profile.gender = gender
        profile.dob = dob
        profile.country = country
        if image:
            profile.profile_image = image
        profile.save()

        return user

class SavedPlaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavedPlace
        fields = '__all__'
        read_only_fields = ['user']

class ProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)
    name = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Profile
        fields = ['name', 'email', 'gender', 'dob', 'country', 'profile_image']
