from django.urls import path
from .views import group_balance_summary

urlpatterns = [
    path('groups/<int:group_id>/balance/', group_balance_summary, name='group-balance'),
]