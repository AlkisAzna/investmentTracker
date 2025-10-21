from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
# from cloudinary.models import CloudinaryField

# import CLoudinary

#--------------------------------------------------------------------------------------
#--------------------------------------------------------------------------------------
# Models
#--------------------------------------------------------------------------------------
#--------------------------------------------------------------------------------------


# User Model
class User(AbstractUser):
    # `username` and `email` fields are already part of AbstractUser
    first_name = models.CharField(max_length=50, blank=False)
    last_name = models.CharField(max_length=50, blank=False)
    country = models.CharField(max_length=100, blank=True, null=True)
    phone_number = models.CharField(max_length=30, blank=False)
    birth_date = models.DateField(null=True, blank=False)
    profile_picture = models.CharField(max_length=500, blank=True, null=True)
    email = models.EmailField(unique=True, blank=False)


# Asset Model
class Asset(models.Model):
    ASSET_TYPE_CHOICES = [
        ('stock', 'Stock'),
        ('crypto', 'Cryptocurrency'),
        ('etf', 'ETF'),
    ]

    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=3)
    change = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    volume = models.CharField(max_length=50, null=True, blank=True)
    asset_type = models.CharField(max_length=20, choices=ASSET_TYPE_CHOICES)

    class Meta:
        indexes = [
            models.Index(fields=['asset_type']),
            models.Index(fields=['name']),
        ]

    def __str__(self):
        return f"{self.name} ({self.asset_type})"
    
class UserAsset(models.Model):
    CATEGORY_CHOICES = [
        ('stock', 'Stock'),
        ('crypto', 'Crypto'),
        ('etf', 'ETF'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assets')
    asset_name = models.CharField(max_length=100)
    quantity = models.DecimalField(max_digits=10, decimal_places=6)
    total_value = models.DecimalField(max_digits=10, decimal_places=3)
    category = models.CharField(max_length=10, choices=CATEGORY_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['user', 'asset_name']
        indexes = [
            models.Index(fields=['user', 'category']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.asset_name} ({self.quantity})"


class UserFunds(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='funds')
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'User Funds'
        verbose_name_plural = 'User Funds'

    def __str__(self):
        return f"{self.user.username} - Balance: ${self.amount}"

class Transaction(models.Model):
    TRANSACTION_TYPE_CHOICES = [
        ('buy', 'Buy'),
        ('sell', 'Sell'),
    ]

    CATEGORY_CHOICES = [
        ('stock', 'Stock'),
        ('crypto', 'Crypto'),
        ('etf', 'ETF'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transactions')
    asset_name = models.CharField(max_length=100)
    quantity = models.DecimalField(max_digits=10, decimal_places=6)
    amount = models.DecimalField(max_digits=10, decimal_places=3)
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPE_CHOICES)
    timestamp = models.DateTimeField(auto_now_add=True)
    category = models.CharField(max_length=10, choices=CATEGORY_CHOICES)

    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['user', '-timestamp']),
            models.Index(fields=['transaction_type']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.transaction_type} {self.quantity} {self.asset_name}"




#--------------------------------------------------------------------------------------
#--------------------------------------------------------------------------------------
#--------------------------------------------------------------------------------------
#--------------------------------------------------------------------------------------



class UserProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    bio = models.TextField(max_length=500, blank=True, null=True)
   # profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)
    
# Investment Portfolio Model
class Portfolio(models.Model):
    """
    Represents an investment portfolio associated with a user.
    """
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100, null=True, blank=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


# Investment Model
class Investment(models.Model):
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE)
    portfolio = models.ForeignKey(Portfolio, related_name='investments', on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    initial_purchase_price = models.DecimalField(max_digits=10, decimal_places=2)
    current_price = models.DecimalField(max_digits=10, decimal_places=2)  # Real-time updated
    purchase_date = models.DateTimeField()

    @property
    def current_value(self):
        return self.quantity * self.current_price

    def __str__(self):
        return f"Investment in {self.asset.name} by {self.user.username}"

