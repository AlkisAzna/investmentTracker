from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
from .models import UserProfile, Portfolio

@receiver(post_save, sender=Portfolio)
def create_portfolio(sender, instance, created, **kwargs):
    if created:
        # Code to execute when a new Portfolio instance is created
        print(f'New Portfolio created: {instance.name}')

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)