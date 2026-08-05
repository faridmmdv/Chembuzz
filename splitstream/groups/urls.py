from rest_framework.routers import DefaultRouter
from .views import GroupViewSet, MembershipViewSet

router = DefaultRouter()
router.register('groups', GroupViewSet, basename='group')
router.register('memberships', MembershipViewSet, basename='membership')

urlpatterns = router.urls