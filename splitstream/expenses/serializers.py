from rest_framework import serializers
from .models import Expense, ExpenseShare


class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = ['id', 'group','paid_by','description','total_amount','created_at']
        read_only_fields = ['paid_by', 'created_at']



class ExpenseShareSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExpenseShare
        fields = ['id','expense','user','amount_owed']
        read_only_fields = ['amount_owed', 'user', 'expense']