
from datetime import datetime
from rest_framework import viewsets, permissions, pagination
from rest_framework import generics
from rest_framework import status
import logging
from rest_framework.response import Response
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth.hashers import make_password
from django.http import JsonResponse
from django.contrib.auth import authenticate
import cloudinary.uploader as cu
from decimal import Decimal
from .models import User, UserProfile, Portfolio, Asset, Investment, UserFunds, UserAsset, Transaction
from .serializers import (UserSerializer, UserProfileSerializer, InvestmentSerializer,
                          PortfolioSerializer,
                          AssetSerializer, UserAssetSerializer,
                          TransactionSerializer
                          )
from .services import TransactionService, EmailService
from .exceptions import (
    InsufficientFundsError,
    InsufficientAssetError,
    AssetNotFoundError
)


logger = logging.getLogger(__name__)

def index(request):
    current_time = datetime.now().strftime("%-I:%S %p")
    current_date = datetime.now().strftime("%A %m %-Y")

    data = {
        'time': current_time,
        'date': current_date,
    }

    return JsonResponse(data)

class StandardPagination(pagination.PageNumberPagination):
    page_size = 100
    page_query_param = 'page_size'
    max_page_size = 1000

class LargeResultsSetPagination(pagination.PageNumberPagination):
    page_size = 1000
    page_query_param = 'page_size'
    max_page_size = 10000


class PasswordResetView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email').strip()
        phone_number = request.data.get('phone_number')
        password = request.data.get('password')

        if not username or not email or not phone_number or not password:
            return Response({'error': 'All fields are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(username=username, email=email, phone_number=phone_number)
        except User.DoesNotExist:
            return Response({'error': 'No matching user found'}, status=status.HTTP_400_BAD_REQUEST)

        user.password = make_password(password)
        user.save()
        return Response({'message': 'Password reset successful'}, status=status.HTTP_200_OK)
    
class UserViewSet(viewsets.ModelViewSet): 
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        user = self.get_object() 
        serializer = self.get_serializer(user)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

    def perform_destroy(self, instance):
        instance.delete()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data) 
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    def perform_create(self, serializer):
        serializer.save()

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        data = request.data

        logger.info("Update request data: %s", data)

        # Separate logic for updating password
        if 'password' in data and 'confirmPassword' in data:
            if data['password'] != data['confirmPassword']:
                return Response({'error': 'Passwords do not match'}, status=status.HTTP_400_BAD_REQUEST)
            if len(data['password']) < 8:
                return Response({'error': 'Password must be at least 8 characters'}, status=status.HTTP_400_BAD_REQUEST)
            instance.set_password(data['password'])
            instance.save()
            return Response({'message': 'Password updated successfully'}, status=status.HTTP_200_OK)
        partial = kwargs.pop('partial', True)
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response(serializer.data)

    def perform_update(self, serializer):
        updated_instance = serializer.save()
        return updated_instance

    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)


class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardPagination

class PortfolioViewSet(viewsets.ModelViewSet):
    queryset = Portfolio.objects.all()
    serializer_class = PortfolioSerializer
    permission_classes = [permissions.IsAuthenticated]

class AssetViewSet(viewsets.ModelViewSet):
    queryset = Asset.objects.all()
    serializer_class = AssetSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter, SearchFilter]
    filterset_fields = ['asset_type']
    ordering_fields = ['name', 'price', 'asset_type']
    search_fields = ['name']
    pagination_class = StandardPagination


class InvestmentViewSet(viewsets.ModelViewSet):
    queryset = Investment.objects.all()
    serializer_class = InvestmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['asset', 'portfolio']
    pagination_class = StandardPagination


class SignupView(APIView):
    permission_classes = [permissions.AllowAny]

    def check_user_exists(self, username, email):
        errors = {}
        if User.objects.filter(username__iexact=username).exists():
            errors['username'] = "A user with that username already exists."
        if User.objects.filter(email__iexact=email).exists():
            errors['email'] = "A user with that email already exists."
        return errors

    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email').strip()
        errors = self.check_user_exists(username, email)
        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)

        data = request.data.copy()
        image = request.data.get('profile_picture')
        if image:
            image_url = self.upload_image(image)
            if image_url:
                data['profile_picture'] = image_url
            else:
                return Response({'error': 'Failed to upload image'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            data['profile_picture'] = None

        serializer = UserSerializer(data=data)
        if serializer.is_valid():
            user = serializer.save()
            self.create_user_funds(user)
            EmailService.send_signup_email(user.email, user.username)

            return self.generate_tokens(user)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


    def upload_image(self, image_data):
        try:
            response = cu.upload(image_data)
            return response['url']
        except Exception as e:
            print(e, "Error uploading image")
            return None

    def create_user_funds(self, user):
        UserFunds.objects.create(user=user, amount=0)

    def generate_tokens(self, user):
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)

        if user is not None:
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


class UserDataView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data)

    def put(self, request):
        user = request.user
        data = request.data

        logger.info("Update request data: %s", data)

        # Separate logic for updating password
        if 'password' in data and 'confirmPassword' in data:
            if data['password'] != data['confirmPassword']:
                return Response({'error': 'Passwords do not match'}, status=status.HTTP_400_BAD_REQUEST)
            if len(data['password']) < 8:
                return Response({'error': 'Password must be at least 8 characters'}, status=status.HTTP_400_BAD_REQUEST)
            user.set_password(data['password'])
            user.save()
            return Response({'message': 'Password updated successfully'}, status=status.HTTP_200_OK)

        # Update profile data
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AssetListView(generics.ListAPIView):
    queryset = Asset.objects.all()
    serializer_class = AssetSerializer

class UserAssetListView(generics.ListAPIView):
    serializer_class = UserAssetSerializer
    
    def get_queryset(self):
        user = self.request.user
        return UserAsset.objects.filter(user=user)


class UserFundsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        funds = UserFunds.objects.get(user=user)
        return Response({'amount': funds.amount})

    def post(self, request):
        user = request.user
        amount = request.data.get('amount')
        funds = UserFunds.objects.get(user=user)
        funds.amount += amount
        funds.save()
        EmailService.send_funds_email(user.email, amount, funds.amount)
        return Response({'amount': funds.amount})

    def put(self, request):
        user = request.user
        amount = request.data.get('amount')
        funds = UserFunds.objects.get(user=user)
        funds.amount = amount
        funds.save()
        EmailService.send_funds_email(user.email, amount, funds.amount)
        return Response({'amount': funds.amount})

    def delete(self, request):
        user = request.user
        funds = UserFunds.objects.get(user=user)
        funds.delete()
        return Response({'message': 'Funds deleted successfully.'})


class TransactionCreateAPIView(generics.CreateAPIView):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        try:
            asset_name = request.data.get('asset_name')
            quantity = Decimal(request.data.get('quantity'))
            amount = Decimal(request.data.get('amount'))
            transaction_type = request.data.get('transaction_type', '').lower()
            category = request.data.get('category')
            if transaction_type not in ['buy', 'sell']:
                return Response(
                    {'error': 'Invalid transaction type. Must be "buy" or "sell"'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            if transaction_type == 'buy':
                TransactionService.execute_buy_transaction(
                    user=request.user,
                    asset_name=asset_name,
                    quantity=quantity,
                    amount=amount,
                    category=category
                )
            else:
                TransactionService.execute_sell_transaction(
                    user=request.user,
                    asset_name=asset_name,
                    quantity=quantity,
                    amount=amount
                )
            TransactionService.create_transaction_record(
                user=request.user,
                asset_name=asset_name,
                quantity=quantity,
                amount=amount,
                transaction_type=transaction_type,
                category=category
            )
            transaction_details = f"""
Transaction Type: {transaction_type.upper()}
Asset Name: {asset_name}
Quantity: {quantity}
Amount: ${amount}
Category: {category}
            """
            EmailService.send_transaction_email(
                request.user.email,
                transaction_details.strip()
            )

            return Response(
                {'message': 'Transaction completed successfully'},
                status=status.HTTP_200_OK
            )

        except (InsufficientFundsError, InsufficientAssetError, AssetNotFoundError) as e:
            logger.warning(f"Transaction failed for user {request.user.username}: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except ValueError as e:
            logger.error(f"Invalid data in transaction: {str(e)}")
            return Response(
                {'error': 'Invalid quantity or amount format'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Unexpected error in transaction: {str(e)}", exc_info=True)
            return Response(
                {'error': 'Transaction failed. Please try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class TransactionListAPIView(generics.ListAPIView):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)
