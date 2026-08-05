
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('groups.urls')),
    path('api/users/', include('users.urls')),
    path('api/', include('expenses.urls')),
    path('api/', include('payments.urls')),
    path('api/', include('balances.urls')),
    path('api/', include('notifications.urls')),
]
