from django.urls import path
from .views import (
    register_user, save_place, get_user_places, delete_place,
    profile_info, update_profile, delete_account,
    mark_place_visited, get_visited_places, submit_review,
    all_reviews_for_place, leaderboard, all_places
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('register/', register_user),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('save-place/', save_place),
    path('my-places/', get_user_places),
    path('delete-place/<int:place_id>/', delete_place),
    path('profile/', profile_info),
    path('profile/update/', update_profile),
    path('delete-account/', delete_account),
    path('visit-place/<int:place_id>/', mark_place_visited),
    path('my-visited/', get_visited_places),
    path('review/<int:visited_place_id>/', submit_review),
    path('leaderboard/', leaderboard),
    path('all-reviews/', all_reviews_for_place),  
    path('all-places/', all_places),              
]
