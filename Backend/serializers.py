"""Handle the Data Conversion, Validation and Object Creation/Update"""
from rest_framework import serializers
from .models import User, UserProfile, Portfolio, Asset, Investment, Transaction
from .models import UserAsset

class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for UserProfile model.
    """
    user = serializers.ReadOnlyField(source='user.username')
    
    class Meta:
        model = UserProfile
        fields = ['user', 'bio'] #profile_picture


#--------------------------------------------------------------------------------------
#--------------------------------------------------------------------------------------
# Serializers
#--------------------------------------------------------------------------------------
#--------------------------------------------------------------------------------------

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'country', 'phone_number', 'profile_picture', 'password', 'birth_date']
        extra_kwargs = {
            'password': {'write_only': True, 'required': False},
            'username': {'required': False},
            'email': {'required': False},
            'first_name': {'required': False},
            'last_name': {'required': False},
            'phone_number': {'required': False},
            'birth_date': {'required': False}
        }
        

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            country=validated_data['country'],
            phone_number=validated_data['phone_number'],
            profile_picture=validated_data['profile_picture'],
            password=validated_data['password'],
            birth_date=validated_data['birth_date']
        )
        return user
    
    def update(self, instance, validated_data):
        """Update user instance with validated data"""
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
    

class AssetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Asset
        fields = ['id', 'name', 'price', 'change', 'volume', 'asset_type']

    def validate_price(self, value):
        if value < 0:
            raise serializers.ValidationError("Price cannot be negative")
        return value

    def validate_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Asset name cannot be empty")
        return value.strip()

class UserAssetSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserAsset
        fields = ['id', 'user', 'asset_name', 'quantity', 'total_value', 'category', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

    def validate_quantity(self, value):
        if value < 0:
            raise serializers.ValidationError("Quantity cannot be negative")
        return value

    def validate_total_value(self, value):
        if value < 0:
            raise serializers.ValidationError("Total value cannot be negative")
        return value
 
class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['id', 'user', 'asset_name', 'quantity', 'amount', 'timestamp', 'transaction_type', 'category']
        read_only_fields = ['id', 'user', 'timestamp']

    def validate_quantity(self, value):
        """Ensure quantity is positive"""
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than 0")
        return value

    def validate_amount(self, value):
        """Ensure amount is positive"""
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than 0")
        return value

    def validate_asset_name(self, value):
        """Ensure asset name is not empty"""
        if not value or not value.strip():
            raise serializers.ValidationError("Asset name cannot be empty")
        return value.strip()

#--------------------------------------------------------------------------------------
#--------------------------------------------------------------------------------------
#--------------------------------------------------------------------------------------
#--------------------------------------------------------------------------------------

    
class PortfolioSerializer(serializers.ModelSerializer):
    """
    Serializer for Portfolio model.
    """
    user = serializers.ReadOnlyField(source='user.username')
    
    class Meta:
        model = Portfolio
        fields = ['id', 'user', 'name', 'description', 'created_at']

        
class  InvestmentSerializer(serializers.ModelSerializer):
    """
    Serializer for Investments
    """
    asset = serializers.ReadOnlyField(source='asset.ticker_symbol')
    portfolio = serializers.ReadOnlyField(source='portfolio.id')
    
    class Meta:
        model = Investment
        fields = ['asset', 'portfolio', 'quantity', 'initial_purchase_price', 'current_price', 'purchase_date']