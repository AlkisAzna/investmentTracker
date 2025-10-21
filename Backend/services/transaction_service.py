"""Transaction business logic service"""
import logging
from decimal import Decimal
from django.db import transaction
from Backend.models import UserAsset, UserFunds, Transaction
from Backend.exceptions import (
    InsufficientFundsError,
    InsufficientAssetError,
    AssetNotFoundError
)

logger = logging.getLogger(__name__)


class TransactionService:
    """Service for handling transaction business logic"""

    @staticmethod
    @transaction.atomic
    def execute_buy_transaction(user, asset_name, quantity, amount, category):
        logger.info(f"User {user.username} buying {quantity} of {asset_name}")

        funds = UserFunds.objects.select_for_update().get(user=user)
        if funds.amount < amount:
            logger.warning(
                f"Insufficient funds for user {user.username}. "
                f"Available: {funds.amount}, Required: {amount}"
            )
            raise InsufficientFundsError(
                f"Insufficient funds. Available: ${funds.amount}, Required: ${amount}"
            )
        user_asset, created = UserAsset.objects.get_or_create(
            user=user,
            asset_name=asset_name,
            defaults={
                'quantity': quantity,
                'total_value': amount,
                'category': category
            }
        )

        if not created:
            user_asset.quantity += quantity
            user_asset.total_value += amount
            user_asset.save()
            logger.info(f"Updated existing asset {asset_name} for user {user.username}")
        else:
            logger.info(f"Created new asset {asset_name} for user {user.username}")
        funds.amount -= amount
        funds.save()

        logger.info(
            f"Buy transaction completed for user {user.username}. "
            f"New balance: ${funds.amount}"
        )
        return user_asset

    @staticmethod
    @transaction.atomic
    def execute_sell_transaction(user, asset_name, quantity, amount):
        logger.info(f"User {user.username} selling {quantity} of {asset_name}")
        try:
            user_asset = UserAsset.objects.select_for_update().get(
                user=user,
                asset_name=asset_name
            )
        except UserAsset.DoesNotExist:
            logger.warning(f"Asset {asset_name} not found for user {user.username}")
            raise AssetNotFoundError(f"Asset {asset_name} not found in your portfolio")
        if user_asset.quantity < quantity:
            logger.warning(
                f"Insufficient assets for user {user.username}. "
                f"Available: {user_asset.quantity}, Required: {quantity}"
            )
            raise InsufficientAssetError(
                f"Insufficient assets. Available: {user_asset.quantity}, Required: {quantity}"
            )
        user_asset.quantity -= quantity
        user_asset.total_value -= amount

        if user_asset.quantity == 0:
            user_asset.delete()
            logger.info(f"Deleted asset {asset_name} for user {user.username} (sold all)")
        else:
            user_asset.save()
            logger.info(f"Updated asset {asset_name} for user {user.username}")
        funds = UserFunds.objects.select_for_update().get(user=user)
        funds.amount += amount
        funds.save()

        logger.info(
            f"Sell transaction completed for user {user.username}. "
            f"New balance: ${funds.amount}"
        )
        return funds

    @staticmethod
    def create_transaction_record(user, asset_name, quantity, amount, transaction_type, category):
        transaction_record = Transaction.objects.create(
            user=user,
            asset_name=asset_name,
            quantity=quantity,
            amount=amount,
            transaction_type=transaction_type,
            category=category
        )
        logger.info(
            f"Transaction record created: {transaction_type} {quantity} "
            f"{asset_name} for user {user.username}"
        )
        return transaction_record
