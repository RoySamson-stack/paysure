# PaySure - Mobile Salary Savings Platform

PaySure is a mobile application that helps users save money by depositing daily amounts and receiving a monthly salary payout. The platform uses M-Pesa for deposits and payouts, with a three-wallet system for managing funds.

## Project Structure

```
paysure/
├── paysure-backend/     # Node.js backend API
├── paysure-mobile/      # React Native mobile app
└── todo.txt            # Detailed project requirements
```

## Features

### Core Functionality
- **Phone Number Authentication**: OTP-based login system
- **Three-Wallet System**: 
  - Deposit Wallet (locked until salary calculation)
  - Salary Wallet (ready for monthly payout)
  - Buffer Wallet (excess deposits)
- **M-Pesa Integration**: STK Push for deposits, B2C for payouts
- **Salary Calculation**: Automatic monthly salary processing
- **Consistency Scoring**: Track user deposit behavior

### User Journey
1. Register with phone number and OTP verification
2. Complete profile setup with salary goals
3. Make daily deposits via M-Pesa
4. Track progress toward monthly salary goal
5. Receive automatic salary payout on specified date

## Backend Setup

### Prerequisites
- Node.js 16+
- PostgreSQL 12+
- M-Pesa Daraja API credentials

### Installation

1. Navigate to backend directory:
```bash
cd paysure-backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables in `.env`:
```env
NODE_ENV=development
PORT=3000
JWT_SECRET=your_super_secret_jwt_key_change_this

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=paysure_db
DB_USER=paysure_user
DB_PASSWORD=your_secure_password

# M-Pesa Configuration
MPESA_CONSUMER_KEY=your_key_from_daraja
MPESA_CONSUMER_SECRET=your_secret_from_daraja
MPESA_BUSINESS_SHORTCODE=174379
MPESA_PASSKEY=your_passkey
MPESA_BASE_URL=https://sandbox.safaricom.co.ke
MPESA_CALLBACK_URL=https://your-ngrok-url.ngrok.io/api/deposits/mpesa-callback
```

4. Set up PostgreSQL database:
```sql
CREATE DATABASE paysure_db;
CREATE USER paysure_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE paysure_db TO paysure_user;
```

5. Start the server:
```bash
npm run dev
```

The backend will be available at `http://localhost:3000`

### API Endpoints

#### Authentication
- `POST /api/auth/send-otp` - Send OTP to phone number
- `POST /api/auth/verify-otp` - Verify OTP and login
- `POST /api/auth/complete-registration` - Complete user registration

#### Deposits
- `POST /api/deposits/initiate` - Initiate M-Pesa deposit
- `POST /api/deposits/mpesa-callback` - M-Pesa callback handler
- `GET /api/deposits/history` - Get deposit history
- `GET /api/deposits/stats` - Get deposit statistics

#### Wallet
- `GET /api/wallet/balances` - Get wallet balances
- `GET /api/wallet/transactions` - Get transaction history

## Mobile App Setup

### Prerequisites
- Node.js 16+
- Expo CLI
- iOS Simulator or Android Emulator

### Installation

1. Navigate to mobile directory:
```bash
cd paysure-mobile
```

2. Install dependencies:
```bash
npm install
```

3. Update API base URL in `src/services/apiService.js`:
```javascript
const API_BASE_URL = 'http://your-backend-url:3000/api';
```

4. Start the development server:
```bash
npm start
```

5. Run on device/simulator:
```bash
npm run ios     # iOS
npm run android # Android
```

### Key Components

#### Screens
- **PhoneNumberScreen**: Phone number entry
- **OTPVerificationScreen**: OTP verification
- **OnboardingScreen**: User registration and setup
- **DashboardScreen**: Main dashboard with wallet balances
- **DepositScreen**: Make M-Pesa deposits

#### Services
- **ApiService**: Backend API communication
- **AuthContext**: Authentication state management

## Database Schema

### Users Table
- User profile information
- Salary goals and payout preferences
- Consistency scores

### Wallets Table
- Three wallet balances per user
- Last updated timestamps

### Deposits Table
- All deposit transactions
- M-Pesa transaction references
- Transaction status tracking

### Salary Payouts Table
- Monthly salary calculations
- Payout history and status

### Transaction Logs Table
- Complete audit trail
- All wallet movements

## M-Pesa Integration

### STK Push Flow
1. User initiates deposit in mobile app
2. Backend calls M-Pesa STK Push API
3. User receives M-Pesa prompt on phone
4. User enters PIN to complete payment
5. M-Pesa sends callback to backend
6. Backend updates wallet balance

### B2C Payout Flow
1. System calculates monthly salary
2. Backend initiates B2C payment
3. M-Pesa transfers money to user
4. Backend processes callback and updates records

## Development Workflow

1. **Backend First**: Set up database models and API endpoints
2. **Mobile Integration**: Connect mobile app to backend APIs
3. **M-Pesa Testing**: Use sandbox environment for testing
4. **User Testing**: Test complete user journey
5. **Production Deploy**: Deploy to production with live M-Pesa

## Security Considerations

- JWT tokens for authentication
- Input validation on all endpoints
- SQL injection prevention
- M-Pesa credential security
- Transaction audit logging
- Rate limiting on sensitive endpoints

## Next Steps

1. Set up PostgreSQL database
2. Configure M-Pesa Daraja API credentials
3. Test backend API endpoints
4. Test mobile app authentication flow
5. Implement remaining screens (wallet view, history, etc.)
6. Add background jobs for salary processing
7. Implement notification system
8. Add admin panel for user management
9. Deploy to production environment

## Support

For questions or issues, refer to the detailed requirements in `todo.txt` or check the implementation notes in the code comments.
# paysure
