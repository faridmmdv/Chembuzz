from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Group, MemberShip
from .serializers import GroupSerializer, MemberShipSerializer


class GroupViewSet(viewsets.ModelViewSet):
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # only show groups the logged-in user is actually a member of
        return Group.objects.filter(memberships__user=self.request.user).distinct()

    def perform_create(self, serializer):
        # auto-set created_by to the logged-in user, never trust client input for this
        group = serializer.save(created_by=self.request.user)
        # automatically make the creator a member of their own group
        MemberShip.objects.create(group=group, user=self.request.user)

    @action(detail=True, methods=['post'])
    def add_member(self, request, pk=None):
        group = self.get_object()
        user_id = request.data.get('user_id')

        if not user_id:
            return Response({'error': 'user_id is required'}, status=400)

        membership, created = MemberShip.objects.get_or_create(group=group, user_id=user_id)

        if not created:
            return Response({'error': 'User is already a member'}, status=400)

        return Response({'status': 'member added'}, status=201)

    @action(detail=True, methods=['post'])
    def remove_member(self, request, pk=None):
        group = self.get_object()
        user_id = request.data.get('user_id')

        deleted, _ = MemberShip.objects.filter(group=group, user_id=user_id).delete()

        if deleted == 0:
            return Response({'error': 'Membership not found'}, status=404)

        return Response({'status': 'member removed'}, status=200)


class MembershipViewSet(viewsets.ModelViewSet):
    serializer_class = MemberShipSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # only show memberships belonging to groups the user is part of
        return MemberShip.objects.filter(group__memberships__user=self.request.user).distinct()