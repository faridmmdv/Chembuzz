from rest_framework import viewsets, permissions
from .models import Expense, ExpenseShare
from .serializers import ExpenseSerializer, ExpenseShareSerializer
from groups.models import MemberShip


class ExpenseViewSet(viewsets.ModelViewSet):
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):

        return Expense.objects.filter(group__memberships__user=self.request.user).distinct()

    def perform_create(self, serializer):
        # auto-set paid_by to the logged-in user
        expense = serializer.save(paid_by=self.request.user)

        # find all members of this expense's group
        group_members = MemberShip.objects.filter(group=expense.group)
        member_count = group_members.count()

        # calculate equal share per person
        share_amount = expense.total_amount / member_count

        # create one ExpenseShare per group member
        for membership in group_members:
            ExpenseShare.objects.create(
                expense=expense,
                user=membership.user,
                amount_owed=share_amount
            )


class ExpenseShareViewSet(viewsets.ModelViewSet):
    serializer_class = ExpenseShareSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # only show shares belonging to expenses in the user's groups
        return ExpenseShare.objects.filter(expense__group__memberships__user=self.request.user).distinct()