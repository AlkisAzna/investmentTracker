'''
This file contains the URL patterns for the Django project. It includes the following:
'''

from django.urls import path, include
from django.contrib import admin
from rest_framework_simplejwt import views as jwt_views
from rest_framework.routers import DefaultRouter
from rest_framework.schemas import get_schema_view

from .views import (UserViewSet, UserProfileViewSet, PortfolioViewSet, InvestmentViewSet,
                    index, PasswordResetView, SignupView, LoginView, UserDataView, AssetListView, UserAssetListView,
                    UserFundsView, TransactionCreateAPIView, TransactionListAPIView)



# Create a router and register our viewsets with it
router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'userprofiles', UserProfileViewSet)
router.register(r'portfolios', PortfolioViewSet)
router.register(r'investments', InvestmentViewSet)

# API documentation
schema_view = get_schema_view(title='Investment Portfolio API', description='API for managing investment portfolios')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),  # Changed to 'api/' to prefix all DRF URLs
    path('api-auth/', include('rest_framework.urls')),

    #--------------------------------------------------------------------------------------
    # URLs
    #--------------------------------------------------------------------------------------

    path('token/', jwt_views.TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', jwt_views.TokenRefreshView.as_view(), name='token_refresh'),
    path('docs/', schema_view, name='api-docs'),
    path('signup', SignupView.as_view(), name='signup'),
    path('login', LoginView.as_view(), name='login'),
    path('user', UserDataView.as_view(), name='user_data'),
    path('assets', AssetListView.as_view(), name='asset-list'),
    path('user-assets', UserAssetListView.as_view(), name='user-asset-list'),
    path('user-funds', UserFundsView.as_view(), name='user-funds'),
    path('transactions/create', TransactionCreateAPIView.as_view(), name='create_transaction'),
    path('transactions/list', TransactionListAPIView.as_view(), name='transaction_list'),
    path('reset-password', PasswordResetView.as_view(), name='reset-password'),
    #--------------------------------------------------------------------------------------
    #--------------------------------------------------------------------------------------

    path('', index, name='index'),
]
