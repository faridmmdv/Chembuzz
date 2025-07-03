from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Avg
from .serializers import (
    RegisterSerializer, SavedPlaceSerializer, ProfileSerializer,
    VisitedPlaceSerializer, ReviewSerializer
)
from .models import SavedPlace, Profile, VisitedPlace, Review
from django.db.models import Q
@api_view(['GET'])
@permission_classes([AllowAny])
def all_places(request):
    """Returns all cultural places from the database."""
    places = SavedPlace.objects.all()
    serializer = SavedPlaceSerializer(places, many=True)
    return Response(serializer.data)

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
        if SavedPlace.objects.filter(user=request.user, name=request.data.get("name")).exists():
            return Response({'message': 'You have already saved this place.'}, status=409)
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

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_place_visited(request, place_id):
    try:
        place = SavedPlace.objects.get(id=place_id, user=request.user)
    except SavedPlace.DoesNotExist:
        return Response({'error': 'Place not found'}, status=404)
    if VisitedPlace.objects.filter(user=request.user, place_id=place_id).exists():
        return Response({'message': 'Already marked as visited.'}, status=200)
    visited = VisitedPlace.objects.create(
        user=request.user,
        place_id=place.id,
        name=place.name,
        tourism=place.tourism,
        amenity=place.amenity,
        city=place.city,
        postcode=place.postcode,
        street=place.street,
        district=place.district,
        website=place.website,
        image=place.image,
        lat=place.lat,
        lng=place.lng,
    )
    place.delete()
    return Response({'message': 'Marked as visited.', 'visited_id': visited.id})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_visited_places(request):
    visited = VisitedPlace.objects.filter(user=request.user)
    serializer = VisitedPlaceSerializer(visited, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_review(request, visited_place_id):
    try:
        vp = VisitedPlace.objects.get(id=visited_place_id, user=request.user)
    except VisitedPlace.DoesNotExist:
        return Response({'error': 'Visited place not found'}, status=404)

    data = request.data
    try:
        rating = int(data.get('rating', 0))
    except (TypeError, ValueError):
        return Response({'error': 'Invalid rating'}, status=400)
    text = data.get('text', '')

    if not (1 <= rating <= 5):
        return Response({'error': 'Rating must be 1-5'}, status=400)

    try:
        review, created = Review.objects.get_or_create(
            visited_place=vp,
            defaults={'rating': rating, 'text': text}
        )
        if not created:
            review.rating = rating
            review.text = text
            review.save()
    except Exception as e:
        import traceback; print(traceback.format_exc())
        return Response({'error': 'Server error: %s' % str(e)}, status=500)

    return Response(ReviewSerializer(review).data, status=200)

@api_view(['GET'])
@permission_classes([AllowAny])
def all_reviews_for_place(request):
    
    name = request.GET.get('name')
    city = request.GET.get('city')
    postcode = request.GET.get('postcode')
    if not name:
        return Response({'error': 'Missing required params'}, status=400)
    vplaces = VisitedPlace.objects.filter(name=name)
    if city:
        vplaces = vplaces.filter(city=city)
    if postcode:
        vplaces = vplaces.filter(postcode=postcode)
    reviews = Review.objects.filter(visited_place__in=vplaces).select_related('visited_place')
    avg_rating = reviews.aggregate(avg=Avg('rating'))['avg'] or 0
    serializer = ReviewSerializer(reviews, many=True)
    
    user_review = None
    if request.user.is_authenticated:
        user_review_obj = reviews.filter(visited_place__user=request.user).first()
        if user_review_obj:
            user_review = ReviewSerializer(user_review_obj).data
    return Response({
        "reviews": serializer.data,
        "average": round(avg_rating, 2) if reviews.exists() else None,
        "count": reviews.count(),
        "user_review": user_review
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def leaderboard(request):
    """
    Returns all users with stats for each category (museum, hotel, theatre, guesthouse, restaurant, gallery, artwork, total).
    Both tourism and amenity fields are counted for categories like restaurant/theatre.
    """
    users = User.objects.all().order_by('id')
    leaderboard = []

    for user in users:
        username = user.username
        profile = Profile.objects.filter(user=user).first()
        avatar_url = profile.profile_image.url if profile and profile.profile_image else None
        visited = VisitedPlace.objects.filter(user=user)

        # Counts both tourism and amenity fields
        def count_type(type_name):
            return visited.filter(Q(tourism=type_name) | Q(amenity=type_name)).count()

        museum = count_type('museum')
        hotel = count_type('hotel')
        theatre = count_type('theatre')
        guesthouse = count_type('guest_house')
        restaurant = count_type('restaurant')
        gallery = count_type('gallery')
        artwork = count_type('artwork')
        total = museum + hotel + theatre + guesthouse + restaurant + gallery + artwork

        leaderboard.append({
            'id': user.id,
            'name': username,
            'avatar': request.build_absolute_uri(avatar_url) if avatar_url else None,
            'museum': museum,
            'theatre': theatre,
            'hotel': hotel,
            'artwork': artwork,
            'guesthouse': guesthouse,
            'gallery': gallery,
            'restaurant': restaurant,
            'total': total,
        })

    leaderboard.sort(key=lambda x: x['total'], reverse=True)
    return Response(leaderboard)
