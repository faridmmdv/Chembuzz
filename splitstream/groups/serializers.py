from rest_framework import serializers
from .models import Group, MemberShip

class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ['id','name', 'created_by', 'created_at']
        read_only_fields = ['created_by', 'created_at']


class MemberShipSerializer(serializers.ModelSerializer):
    class Meta:
        model = MemberShip
        fields = ['id','group', 'user', 'joined_at']
        read_only_fields = ['joined_at']