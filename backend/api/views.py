from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from .serializers import RegisterSerializer, SavedPlaceSerializer, ProfileSerializer
from .models import SavedPlace, Profile

@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
@permission_classes([AllowAny])
def register_user(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'User registered successfully'}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_place(request):
    serializer = SavedPlaceSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response({'message': 'Place saved ✅'})
    return Response(serializer.errors, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_places(request):
    places = SavedPlace.objects.filter(user=request.user)
    serializer = SavedPlaceSerializer(places, many=True)
    return Response(serializer.data)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_place(request, place_id):
    try:
        place = SavedPlace.objects.get(id=place_id, user=request.user)
        place.delete()
        return Response({'message': 'Place deleted'})
    except SavedPlace.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile_info(request):
    try:
        profile = Profile.objects.get(user=request.user)
        serializer = ProfileSerializer(profile, context={'request': request})
        return Response(serializer.data)
    except Profile.DoesNotExist:
        return Response({'error': 'Profile not found'}, status=404)

@api_view(['PUT'])
@parser_classes([MultiPartParser, FormParser])
@permission_classes([IsAuthenticated])
def update_profile(request):
    user = request.user
    try:
        profile = Profile.objects.get(user=user)
    except Profile.DoesNotExist:
        return Response({'error': 'Profile not found'}, status=404)

    user.username = request.data.get('name', user.username)
    user.email = request.data.get('email', user.email)
    user.save()

    profile.country = request.data.get('country', profile.country)
    profile.gender = request.data.get('gender', profile.gender)
    profile.dob = request.data.get('dob', profile.dob)

    if 'profile_image' in request.FILES:
        profile.profile_image = request.FILES['profile_image']

    profile.save()
    return Response({'message': 'Profile updated successfully'})

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_account(request):
    user = request.user
    user.delete()
    return Response({'message': 'Account deleted successfully'}, status=200)
