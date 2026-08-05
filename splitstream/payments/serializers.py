from rest_framework import serializers
from .models import Payment

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'group','paid_by','paid_to','amount','created_at']
        read_only_fields = ['paid_by',  'created_at']