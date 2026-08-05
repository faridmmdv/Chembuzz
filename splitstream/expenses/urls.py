from rest_framework.routers import DefaultRouter
from .views import ExpenseViewSet, ExpenseShareViewSet

router = DefaultRouter()
router.register('expenses', ExpenseViewSet, basename='expenses')
router.register('expense-shares', ExpenseShareViewSet, basename='expenses_share')

urlpatterns = router.urls