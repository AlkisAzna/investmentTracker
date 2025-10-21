"""Email service for sending notifications"""
import logging
from django.core.mail import EmailMessage
from django.conf import settings

logger = logging.getLogger(__name__)


class EmailService:
    """Service for sending emails to users"""

    @staticmethod
    def send_email(subject, message, recipient_list, html_message=None):
        try:
            email = EmailMessage(
                subject=subject,
                body=message,
                from_email=settings.EMAIL_HOST_USER,
                to=recipient_list,
            )

            if html_message:
                email.content_subtype = 'html'
                email.body = html_message

            email.send(fail_silently=False)
            logger.info(f"Email sent successfully to {recipient_list}")
            return True
        except Exception as e:
            logger.error(f"Failed to send email to {recipient_list}: {str(e)}")
            return False

    @classmethod
    def send_signup_email(cls, user_email, user_name):
        subject = '[InvestmentTracker] Welcome to Investment Tracker!'
        message = f"""
Hi {user_name},

Welcome to Investment Tracker! Thank you for signing up.

Start tracking your investments today and make informed decisions about your portfolio.

Key Features:
- Track stocks, ETFs, and cryptocurrencies
- Virtual trading to practice strategies
- Real-time portfolio analytics
- Transaction history and reporting

Get started by adding funds to your account and making your first trade!

Best regards,
The InvestmentTracker Team
        """

        cls.send_email(subject, message.strip(), [user_email])

    @classmethod
    def send_transaction_email(cls, user_email, transaction_details):
        subject = '[InvestmentTracker] Transaction Confirmation'
        message = f"""
Hi,

Your transaction has been completed successfully!

Transaction Details:
{transaction_details}

You can view your updated portfolio and transaction history in your dashboard.

Best regards,
The InvestmentTracker Team
        """

        cls.send_email(subject, message.strip(), [user_email])

    @classmethod
    def send_funds_email(cls, user_email, amount, total_balance):
        subject = '[InvestmentTracker] Balance Updated'
        message = f"""
Hi,

Your account balance has been updated.

Amount Added: ${amount}
New Balance: ${total_balance}

You can now use these funds to trade stocks, ETFs, and cryptocurrencies.

Best regards,
The InvestmentTracker Team
        """

        cls.send_email(subject, message.strip(), [user_email])

    @classmethod
    def send_password_reset_email(cls, user_email, user_name):
        subject = '[InvestmentTracker] Password Reset Successful'
        message = f"""
Hi {user_name},

Your password has been successfully reset.

If you did not request this password reset, please contact our support team immediately.

For security:
- Never share your password with anyone
- Use a strong, unique password
- Enable two-factor authentication if available

Best regards,
The InvestmentTracker Team
        """

        cls.send_email(subject, message.strip(), [user_email])
