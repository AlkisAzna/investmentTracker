from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import User, Stock, ETF, Cryptocurrency, BlogPost

class UserViewSetTests(APITestCase):
    
    def test_list_users(self):
        """
        Ensure we can list all users.
        """
        url = reverse('user-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_user(self):
        """
        Ensure we can create a new user object.
        """
        url = reverse('user-list')
        data = {'username': 'newuser', 'password': 'testpass123'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 1)
        self.assertEqual(User.objects.get().username, 'newuser')

class StockViewSetTests(APITestCase):

    def test_list_stocks(self):
        """
        Ensure we can list all stocks.
        """
        url = reverse('stock-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_update_stock(self):
        """
        Ensure we can update an existing stock.
        """
        stock = Stock.objects.create(name='Test Stock', ticker='TEST')
        url = reverse('stock-detail', args=[stock.id])
        data = {'name': 'Updated Name'}
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        updated = Stock.objects.get(pk=stock.id)
        self.assertEqual(updated.name, 'Updated Name')

class ETFViewSetTests(APITestCase):

    def test_list_stocks(self):
        """
        Ensure we can list all etfs.
        """
        url = reverse('etf-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_update_stock(self):
        """
        Ensure we can update an existing etf.
        """
        stock = ETF.objects.create(name='Test ETF', ticker='TEST')
        url = reverse('etf-detail', args=[stock.id])
        data = {'name': 'Updated Name'}
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        updated = ETF.objects.get(pk=stock.id)
        self.assertEqual(updated.name, 'Updated Name')

class CryptocurrencyViewSetTests(APITestCase):

    def test_list_crypto(self):
        """
        Ensure we can list all crypto.
        """
        url = reverse('crypto-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_update_crypto(self):
        """
        Ensure we can update an existing crypto.
        """
        stock = Cryptocurrency.objects.create(name='Test Crypto', ticker='TEST')
        url = reverse('crypto-detail', args=[stock.id])
        data = {'name': 'Updated Name'}
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        updated = Cryptocurrency.objects.get(pk=stock.id)
        self.assertEqual(updated.name, 'Updated Name')


class BlogPostViewSetTests(APITestCase):

    def test_create_post(self):
        """
        Ensure we can create a new blog post object.
        """
        url = reverse('post-list')
        data = {'title': 'New Post', 'content': 'Content here'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(BlogPost.objects.count(), 1)
        self.assertEqual(BlogPost.objects.get().title, 'New Post')