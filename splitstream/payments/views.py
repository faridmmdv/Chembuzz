from rest_framework import viewsets, permissions
from .models import Payment
from .serializers import PaymentSerializer

class PaymentViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Payment.objects.filter(group__memberships__user=self.request.user).distinct()

    def perform_create(self, serializer):
        serializer.save(paid_by= self.request.user)