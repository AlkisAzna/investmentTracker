from django.core.mail import send_mail
from django.conf import settings

def send_signup_email(user_email, user_name):
    subject = '[InvestmentTracker] Welcome to Investment Tracker!'
    message = f'Hi {user_name},\nWelcome to Investment Tracker! Thank you for signing up. Enjoy!\n\n InvestmentTracker Team'
    email_from = settings.EMAIL_HOST_USER
    recipient_list = [user_email]
    send_mail(subject, message, email_from, recipient_list)

def send_transaction_email(user_email, transaction_details):
    subject = '[InvestmentTracker] Transaction Notification!'
    message = f'Hi,\nYou implemented a new transaction!\nYour recent transaction details:\n{transaction_details}\n\n InvestmentTracker Team'
    email_from = settings.EMAIL_HOST_USER
    recipient_list = [user_email]
    send_mail(subject, message, email_from, recipient_list)
    
def send_funds_email(user_email, amount, total_balance):
    subject = '[InvestmentTracker] Balance Updated!'
    message = f'Hi,\nYou added some funds to your account!\nBalance added: {amount}\nTotal Balance: {total_balance}\n\n InvestmentTracker Team'
    email_from = settings.EMAIL_HOST_USER
    recipient_list = [user_email]
    send_mail(subject, message, email_from, recipient_list)