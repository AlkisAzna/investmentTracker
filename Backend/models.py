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
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=3, blank=True)
    change = models.DecimalField(max_digits=5, decimal_places=2, blank=True)
    volume = models.CharField(max_length=50, blank=True)
    asset_type = models.CharField(max_length=20, blank=True)
    
class UserAsset(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    asset_name = models.CharField(max_length=100, blank=False, default="")
    quantity = models.DecimalField(max_digits=10, decimal_places=6, blank=False)
    total_value = models.DecimalField(max_digits=10, decimal_places=3, blank=False)
    category = models.CharField(max_length=10, blank=False, default="")


class UserFunds(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=0, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True, blank=True, null=True)

class Transaction(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, blank=False)
    asset_name = models.CharField(max_length=100, blank=False)
    quantity = models.DecimalField(max_digits=10, decimal_places=6, blank=False)
    amount = models.DecimalField(max_digits=10, decimal_places=3, blank=False)
    transaction_type = models.CharField(max_length=10, blank=False, choices=[('buy', 'Buy'), ('sell', 'Sell')])
    timestamp = models.DateTimeField(auto_now_add=True)
    category = models.CharField(max_length=10, blank=False, default="")




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

