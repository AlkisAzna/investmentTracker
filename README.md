# InvestmentTracker

A full-stack web application for tracking and managing investment portfolios, supporting stocks, ETFs, and cryptocurrencies with virtual trading capabilities.

## Technical Stack

### Backend
- **Framework**: Django 5.0.3 with Django REST Framework 3.15.1
- **Database**: MySQL 8.0+
- **Authentication**: JWT (djangorestframework-simplejwt 5.3.1)
- **Media Storage**: Cloudinary
- **Additional**: CORS support, SSL/TLS configuration, Python-dotenv for environment management

### Frontend
- **Framework**: React.js 18.x
- **UI Library**: Material-UI (MUI)
- **HTTP Client**: Axios with interceptors
- **State Management**: React Context API
- **Styling**: Bootstrap 5 + Custom CSS

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Database Management**: phpMyAdmin (development)
- **SSL/TLS**: Self-signed certificates for local HTTPS

## System Architecture

### Backend Services
The application follows a service-oriented architecture with clear separation of concerns:

- **Views Layer**: Handles HTTP requests/responses and authentication
- **Services Layer**: Contains business logic (TransactionService, EmailService)
- **Models Layer**: Database schema and ORM relationships
- **Serializers**: Data validation and serialization

### Data Models

#### User Management
- **User**: Extended AbstractUser with profile fields (phone, birth_date, profile_picture, country)
- **UserProfile**: Additional user metadata
- **UserFunds**: Tracks available cash balance per user

#### Asset Management
- **Asset**: Master list of tradeable assets (stocks, ETFs, cryptocurrencies)
- **UserAsset**: User-owned assets with quantity and total value tracking
- **Transaction**: Complete transaction history (buy/sell operations)

#### Portfolio Management
- **Portfolio**: Named collections of investments
- **Investment**: Links assets to portfolios with allocation tracking

## API Reference

### Authentication Endpoints

#### Register New User
```
POST /signup
Content-Type: application/json

{
  "username": "string",
  "email": "string",
  "password": "string",
  "first_name": "string",
  "last_name": "string",
  "phone_number": "string",
  "birth_date": "YYYY-MM-DD",
  "country": "string" (optional),
  "profile_picture": "base64_image" (optional)
}

Response: { "access": "jwt_token", "refresh": "refresh_token" }
```

#### Login
```
POST /login
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}

Response: { "access": "jwt_token", "refresh": "refresh_token" }
```

#### Token Refresh
```
POST /token/refresh/
Content-Type: application/json

{
  "refresh": "refresh_token"
}

Response: { "access": "new_jwt_token" }
```

#### Password Reset
```
POST /reset-password
Content-Type: application/json

{
  "username": "string",
  "email": "string",
  "phone_number": "string",
  "password": "new_password"
}
```

### User Data Endpoints

#### Get Current User Data
```
GET /user
Authorization: Bearer {jwt_token}

Response: User object with all profile fields
```

#### Update User Profile
```
PUT /user
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "first_name": "string",
  "last_name": "string",
  "email": "string",
  "phone_number": "string",
  "country": "string"
}
```

### Funds Management

#### Get User Balance
```
GET /user-funds
Authorization: Bearer {jwt_token}

Response: { "amount": "decimal" }
```

#### Add Funds
```
POST /user-funds
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "amount": decimal
}
```

#### Update Funds (Set Balance)
```
PUT /user-funds
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "amount": decimal
}
```

### Trading Endpoints

#### Execute Transaction
```
POST /transactions/create
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "asset_name": "string",
  "quantity": decimal,
  "amount": decimal,
  "transaction_type": "buy" | "sell",
  "category": "stock" | "crypto" | "etf"
}

Response: { "message": "Transaction completed successfully" }
```

#### Get Transaction History
```
GET /transactions/list
Authorization: Bearer {jwt_token}

Response: Array of transaction objects
```

### Asset Endpoints

#### Get All Available Assets
```
GET /assets
Authorization: Bearer {jwt_token}

Response: Array of asset objects
```

#### Get User's Portfolio Assets
```
GET /user-assets
Authorization: Bearer {jwt_token}

Response: Array of user asset objects with quantities and values
```

### REST API Resources

The following resources are available through Django REST Framework viewsets at `/api/`:

- **Users**: `/api/users/` (CRUD operations, admin only)
- **User Profiles**: `/api/userprofiles/` (CRUD operations)
- **Portfolios**: `/api/portfolios/` (CRUD operations)
- **Investments**: `/api/investments/` (CRUD operations)

All REST endpoints support standard HTTP methods (GET, POST, PUT, PATCH, DELETE) and include filtering, search, and pagination.

## Installation and Setup

### Prerequisites

- Docker Desktop (recommended) or:
  - Python 3.10+
  - Node.js 16+
  - MySQL 8.0+
- Git

### Environment Configuration

1. Clone the repository:
```bash
git clone <repository-url>
cd investor_portfolio
```

2. Create environment files from templates:
```bash
cp .env.example .env
cp secrets.env.example secrets.env
```

3. Configure `.env` file:
```env
# Cloudinary Configuration
CLOUD_NAME=your_cloudinary_cloud_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret

# Frontend API Configuration
REACT_APP_API_BASE_URL=https://localhost:8001

# Database Configuration
MYSQL_DATABASE=investors_db
MYSQL_USER=user
MYSQL_PASSWORD=secure_password_here
MYSQL_ROOT_PASSWORD=secure_root_password_here

# Application Settings
DEBUG=0
```

4. Configure `secrets.env` file:
```env
# Generate Django secret key
DJANGO_SECRET_KEY=your_generated_secret_key

# Django allowed hosts
DJANGO_ALLOWED_HOSTS=127.0.0.1,localhost

# Email configuration (Gmail example)
EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_app_specific_password
```

5. Generate a Django secret key:
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### SSL Certificate Setup

For local HTTPS development, generate self-signed certificates:

```bash
# Install mkcert (if not already installed)
# On Windows with Chocolatey:
choco install mkcert

# On macOS with Homebrew:
brew install mkcert

# Generate certificates
mkcert -install
mkcert localhost 127.0.0.1 ::1

# Move certificates to project
mkdir certificates
mv localhost+2.pem certificates/
mv localhost+2-key.pem certificates/
```

### Running with Docker (Recommended)

```bash
docker-compose up --build
```

The application will be available at:
- Frontend: https://localhost:3000
- Backend API: https://localhost:8001
- phpMyAdmin: http://localhost:8085
- MySQL: localhost:3307

### Running Locally Without Docker

#### Backend Setup

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Run development server
python manage.py runsslserver 0.0.0.0:8001 --certificate certificates/localhost+2.pem --key certificates/localhost+2-key.pem
```

#### Frontend Setup

```bash
cd Frontend/my-trading-app

# Install dependencies
npm install

# Configure SSL (for HTTPS)
set HTTPS=true
set SSL_CRT_FILE=../../certificates/localhost+2.pem
set SSL_KEY_FILE=../../certificates/localhost+2-key.pem

# Start development server
npm start
```

## Project Structure

```
investor_portfolio/
├── Backend/
│   ├── services/
│   │   ├── __init__.py
│   │   ├── transaction_service.py    # Business logic for transactions
│   │   └── email_service.py          # Email notification service
│   ├── exceptions/
│   │   └── __init__.py               # Custom exception classes
│   ├── migrations/                   # Database migrations
│   ├── management/
│   │   └── commands/
│   │       └── wait_for_db.py        # Database connection helper
│   ├── admin.py                      # Django admin configuration
│   ├── models.py                     # Database models
│   ├── views.py                      # API views and endpoints
│   ├── serializers.py                # DRF serializers with validation
│   ├── urls.py                       # URL routing
│   ├── Dockerfile                    # Backend container configuration
│   └── requirements.txt              # Python dependencies
├── Frontend/
│   └── my-trading-app/
│       ├── src/
│       │   ├── api/
│       │   │   ├── apiCalls.js       # API functions
│       │   │   └── constants.js      # API endpoints
│       │   ├── components/
│       │   │   └── ErrorBoundary.js  # Error handling component
│       │   ├── contexts/
│       │   │   └── AuthContext.js    # Authentication state management
│       │   ├── services/
│       │   │   └── api.js            # Axios instance with interceptors
│       │   ├── App.js                # Main application component
│       │   └── index.js              # Application entry point
│       ├── public/                   # Static assets
│       ├── package.json              # Node dependencies
│       └── Dockerfile                # Frontend container configuration
├── Setup/
│   ├── settings.py                   # Django configuration
│   ├── urls.py                       # Root URL configuration
│   └── wsgi.py                       # WSGI configuration
├── certificates/                     # SSL certificates (not in git)
├── logs/                             # Application logs (not in git)
├── docker-compose.yml                # Docker orchestration
├── .env.example                      # Environment template
├── secrets.env.example               # Secrets template
├── .gitignore                        # Git ignore rules
├── manage.py                         # Django management script
└── README.md                         # This file
```

## Key Features

### Transaction Management
- Buy and sell operations for stocks, ETFs, and cryptocurrencies
- Atomic transactions with row-level locking for data integrity
- Automatic balance validation and asset availability checks
- Complete transaction history tracking
- Email notifications for all transactions

### Portfolio Tracking
- Real-time portfolio value calculation
- Multi-category asset support (stocks, ETFs, crypto)
- Transaction history with detailed records
- Asset quantity and value tracking

### Security Features
- JWT-based authentication with automatic token refresh
- Secure password hashing (Django default PBKDF2)
- HTTPS enforcement for all communications
- CORS configuration for frontend-backend separation
- Environment-based secrets management
- Row-level database locking for concurrent operations

### Email Notifications
- Welcome email upon registration
- Transaction confirmation emails
- Balance update notifications
- Password reset confirmations

## Business Logic

### Transaction Service

The `TransactionService` handles all trading operations with the following guarantees:

**Buy Transactions:**
1. Validates sufficient funds availability
2. Deducts amount from user balance
3. Creates or updates user asset record
4. Records transaction in history
5. All operations are atomic (either all succeed or all fail)

**Sell Transactions:**
1. Validates asset ownership and quantity
2. Adds proceeds to user balance
3. Updates or removes user asset record
4. Records transaction in history
5. All operations are atomic

### Email Service

The `EmailService` provides non-blocking email notifications:
- Signup welcome emails
- Transaction confirmations
- Funds update notifications
- Password reset confirmations

All email operations fail silently to prevent blocking user actions.

## Database Schema

### Core Relationships
- User (1) → (1) UserFunds
- User (1) → (N) UserAsset
- User (1) → (N) Transaction
- User (1) → (N) Portfolio
- Portfolio (1) → (N) Investment

### Indexes
Performance indexes on:
- Asset.asset_type, Asset.name
- UserAsset.user + UserAsset.category
- Transaction.user, Transaction.timestamp

## Admin Panel

Access the Django admin panel at `https://localhost:8001/admin/`

Features:
- User management with search and filtering
- Asset catalog management
- Transaction monitoring (read-only to prevent manual entry)
- Portfolio and investment tracking
- Search, filters, and date hierarchies on all models

## Development Notes

### Adding New Dependencies

**Backend:**
```bash
pip install package_name
pip freeze > requirements.txt
```

**Frontend:**
```bash
npm install package_name
```

### Database Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### Logging

Application logs are stored in the `logs/` directory:
- `django.log`: All application logs (INFO and above)
- `django_errors.log`: Error logs only

Log rotation is configured for 15MB files with 10 backups.

## Security Considerations

### Important Security Notes

1. **Never commit sensitive files:**
   - `.env` and `secrets.env` contain credentials
   - `certificates/` directory contains SSL keys
   - `logs/` may contain sensitive information

2. **Production deployment:**
   - Set `DEBUG=0` in `.env`
   - Use strong, unique database passwords
   - Generate new Django secret key
   - Configure proper ALLOWED_HOSTS
   - Use production-grade SSL certificates
   - Set up proper email service credentials
   - Configure Cloudinary with restricted API keys

3. **Cloudinary configuration:**
   - The application uses environment variables for Cloudinary
   - Never hardcode credentials in code
   - Set up upload presets with appropriate restrictions

4. **Email configuration:**
   - For Gmail, use App Passwords (not account password)
   - Configure SMTP settings in Django settings.py
   - Current configuration uses Gmail SMTP

## API Error Responses

The API returns standard HTTP status codes:

- **200 OK**: Successful request
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid input data or business logic error
- **401 Unauthorized**: Missing or invalid authentication
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server-side error

Error response format:
```json
{
  "error": "Error message description"
}
```

## Testing

The application includes comprehensive validation at multiple levels:
- Model-level constraints
- Serializer validation
- Service-layer business logic validation
- Atomic database transactions for data integrity

## License

See LICENSE file for details.

## Support

For issues, questions, or contributions, please refer to the project repository issue tracker.
