# PaySure Backend - MVP Quick Start Guide

## Prerequisites
- Node.js 16+ installed
- npm or yarn package manager

## Setup (5 minutes)

### 1. Install Dependencies
```bash
cd paysure-backend
npm install
```

### 2. Initialize Database
```bash
npm run init-db
```

This creates:
- SQLite database file (`paysure_mvp.db`)
- Database tables
- Demo user with sample data

### 3. Start Server
```bash
npm run dev
```

Server runs on: `http://localhost:3000`

## Demo Credentials

### User Login
- Phone: `254712345678`
- OTP: Any 6-digit code (e.g., `123456`)

### API Integration
- API Key: `paysure_api_integration_key_2026`
- Header: `X-API-Key: paysure_api_integration_key_2026`

## Quick Test

### 1. Health Check
```bash
curl http://localhost:3000/health
```

### 2. Send OTP
```bash
curl -X POST http://localhost:3000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "254712345678"}'
```

### 3. Verify OTP
```bash
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "254712345678", "otp": "123456"}'
```

Save the token from response!

### 4. Get Wallet Balance
```bash
curl http://localhost:3000/api/wallet/balances \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 5. Integration API - Get User Balance
```bash
curl http://localhost:3000/api/v1/balance/254712345678 \
  -H "X-API-Key: paysure_api_integration_key_2026"
```

## API Documentation

Full API docs: `API_DOCUMENTATION.md`

## Security Audit

Security review: `SECURITY_AUDIT.md`

## Project Structure

```
paysure-backend/
├── src/
│   ├── app.js                 # Main application
│   ├── config/
│   │   └── database.js        # Database configuration
│   ├── models/                # Database models
│   ├── controllers/           # Request handlers
│   ├── routes/                # API routes
│   ├── middleware/            # Security & validation
│   ├── services/              # Business logic
│   └── scripts/
│       └── initDb.js          # Database initialization
├── paysure_mvp.db            # SQLite database (created after init)
├── .env                       # Environment variables
├── package.json
├── API_DOCUMENTATION.md       # Complete API docs
└── SECURITY_AUDIT.md         # Security review

```

## Available Endpoints

### User Endpoints (Require JWT)
- `POST /api/auth/send-otp` - Send OTP
- `POST /api/auth/verify-otp` - Verify OTP & login
- `POST /api/auth/complete-registration` - Complete profile
- `POST /api/deposits/initiate` - Initiate deposit
- `GET /api/deposits/history` - Deposit history
- `GET /api/deposits/stats` - Deposit statistics
- `GET /api/wallet/balances` - Wallet balances
- `GET /api/wallet/transactions` - Transaction history

### Integration Endpoints (Require API Key)
- `GET /api/v1/users/:phoneNumber` - Get user info
- `GET /api/v1/balance/:phoneNumber` - Get balance
- `GET /api/v1/transactions/:phoneNumber` - Get transactions
- `GET /api/v1/stats/:phoneNumber` - Get statistics
- `POST /api/v1/webhook/deposit` - External deposit notification

## Environment Variables

Key variables in `.env`:
```env
PORT=3000
JWT_SECRET=paysure_mvp_secret_key_2026_change_in_production
API_KEY_SECRET=paysure_api_integration_key_2026
DB_STORAGE=./paysure_mvp.db
```

## Security Features

✅ Rate limiting on all endpoints
✅ JWT authentication
✅ API key authentication for integrations
✅ Input validation & sanitization
✅ Helmet.js security headers
✅ CORS protection
✅ SQL injection prevention
✅ XSS protection

## M-Pesa Integration

For M-Pesa testing:
1. Get credentials from Daraja Portal
2. Update `.env` with your credentials
3. Use ngrok for callback URL: `ngrok http 3000`
4. Update `MPESA_CALLBACK_URL` in `.env`

## Troubleshooting

### Database Issues
```bash
# Reset database
rm paysure_mvp.db
npm run init-db
```

### Port Already in Use
```bash
# Change port in .env
PORT=3001
```

### Dependencies Issues
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

## Production Deployment

Before deploying to production:

1. **Change Secrets**
   ```bash
   # Generate new JWT secret
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   
   # Generate new API key
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Use PostgreSQL**
   - Update `src/config/database.js`
   - Install `pg` package
   - Configure connection string

3. **Enable HTTPS**
   - Get SSL certificate
   - Configure reverse proxy (nginx)
   - Update CORS origins

4. **Set Environment**
   ```env
   NODE_ENV=production
   ```

5. **Review Security**
   - Read `SECURITY_AUDIT.md`
   - Implement high-priority recommendations
   - Set up monitoring

## Support

- API Documentation: `API_DOCUMENTATION.md`
- Security Audit: `SECURITY_AUDIT.md`
- Main README: `../README.md`

## Next Steps

1. ✅ Backend is ready for MVP showcase
2. Connect mobile app to backend
3. Test complete user flow
4. Configure M-Pesa for live testing
5. Deploy to staging environment
6. Conduct security review
7. Deploy to production

---

**MVP Status: ✅ READY FOR SHOWCASE**

The backend is fully functional with:
- Complete authentication system
- Wallet management
- Deposit tracking
- Transaction history
- Third-party integration API
- Comprehensive security measures
- Demo data for testing
