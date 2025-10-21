from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import (
    User, UserProfile, Asset, UserAsset, UserFunds,
    Transaction, Portfolio, Investment
)


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'first_name', 'last_name', 'country', 'date_joined']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    list_filter = ['date_joined', 'is_active', 'country']
    ordering = ['-date_joined']


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'bio']
    search_fields = ['user__username']


@admin.register(Asset)
class AssetAdmin(admin.ModelAdmin):
    list_display = ['name', 'asset_type', 'price', 'change', 'volume']
    list_filter = ['asset_type']
    search_fields = ['name']
    ordering = ['name']


@admin.register(UserAsset)
class UserAssetAdmin(admin.ModelAdmin):
    list_display = ['user', 'asset_name', 'quantity', 'total_value', 'category', 'updated_at']
    list_filter = ['category', 'created_at']
    search_fields = ['user__username', 'asset_name']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-updated_at']


@admin.register(UserFunds)
class UserFundsAdmin(admin.ModelAdmin):
    list_display = ['user', 'amount', 'updated_at']
    search_fields = ['user__username']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['user']


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ['user', 'asset_name', 'transaction_type', 'quantity', 'amount', 'category', 'timestamp']
    list_filter = ['transaction_type', 'category', 'timestamp']
    search_fields = ['user__username', 'asset_name']
    readonly_fields = ['timestamp']
    date_hierarchy = 'timestamp'
    ordering = ['-timestamp']

    def has_add_permission(self, request):
        return False


@admin.register(Portfolio)
class PortfolioAdmin(admin.ModelAdmin):
    list_display = ['name', 'user', 'created_at']
    search_fields = ['name', 'user__username']
    list_filter = ['created_at']
    readonly_fields = ['created_at']


@admin.register(Investment)
class InvestmentAdmin(admin.ModelAdmin):
    list_display = ['portfolio', 'asset', 'quantity', 'initial_purchase_price', 'current_price', 'purchase_date']
    search_fields = ['portfolio__name', 'asset__name']
    list_filter = ['purchase_date']
    readonly_fields = ['purchase_date']