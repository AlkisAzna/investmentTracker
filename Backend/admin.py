from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, UserProfile

# Registering the User model with the default UserAdmin is fine if you don't need to customize it further
admin.site.register(User, BaseUserAdmin)

# If you want to customize the admin for UserProfile or other models, you can define custom ModelAdmin classes
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'bio']

admin.site.register(UserProfile, UserProfileAdmin)