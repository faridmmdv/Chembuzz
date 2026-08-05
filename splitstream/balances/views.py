from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Sum
from expenses.models import ExpenseShare
from payments.models import Payment

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def group_balance_summary(request, group_id):
    # total owed by each user in this group (from expense shares)
    shares = ExpenseShare.objects.filter(expense__group_id=group_id, user=request.user)
    total_owed = shares.aggregate(total=Sum('amount_owed'))['total'] or 0

    # total already paid by this user in this group
    payments = Payment.objects.filter(group_id=group_id, paid_by=request.user)
    total_paid = payments.aggregate(total=Sum('amount'))['total'] or 0

    remaining_balance = total_owed - total_paid

    return Response({
        'group_id': group_id,
        'total_owed': total_owed,
        'total_paid': total_paid,
        'remaining_balance': remaining_balance
    })