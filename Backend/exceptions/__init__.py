"""Custom exceptions for Backend"""


class InsufficientFundsError(Exception):
    """Raised when user has insufficient funds"""
    pass


class InsufficientAssetError(Exception):
    """Raised when user has insufficient assets"""
    pass


class AssetNotFoundError(Exception):
    """Raised when asset is not found"""
    pass


__all__ = ['InsufficientFundsError', 'InsufficientAssetError', 'AssetNotFoundError']
