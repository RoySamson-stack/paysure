# PaySure Backend API Documentation

## Base URL
```
Development: http://localhost:3000
Production: https://api.paysure.com
```

## Security

### Rate Limiting
- General API: 100 requests per 15 minutes
- OTP requests: 3 requests per 15 minutes
- Authentication: 5 requests per 15 minutes
- Deposits: 10 requests per minute

### Authentication
User endpoints require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

### API Key (Third-party Integration)
Integration endpoints require API key in header:
```
X-API-Key: <your-api-key>
```

---

## User Authentication Endpoints

### 1. Send OTP
Request OTP for phone number authentication.

**Endpoint:** `POST /api/auth/send-otp`

**Request Body:**
```json
{
  "phoneNumber": "254712345678"
}
```

**Response:**
```json
{
  "message": "OTP sent successfully",
  "expiresIn": "5 minutes"
}
```

**Rate Limit:** 3 requests per 15 minutes

---

### 2. Verify OTP
Verify OTP and receive authentication token.

**Endpoint:** `POST /api/auth/verify-otp`

**Request Body:**
```json
{
  "phoneNumber": "254712345678",
  "otp": "123456"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "phoneNumber": "254712345678",
    "isRegistrationComplete": false
  }
}
```

---

### 3. Complete Registration
Complete user profile setup.

**Endpoint:** `POST /api/auth/complete-registration`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "targetSalary": 5000,
  "payoutDay": 28
}
```

**Response:**
```json
{
  "message": "Registration completed successfully",
  "user": {
    "id": 1,
    "phoneNumber": "254712345678",
    "firstName": "John",
    "lastName": "Doe",
    "targetSalary": 5000,
    "payoutDay": 28
  }
}
```

---

## Deposit Endpoints

### 4. Initiate Deposit
Start M-Pesa STK Push for deposit.

**Endpoint:** `POST /api/deposits/initiate`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "amount": 100
}
```

**Response:**
```json
{
  "message": "STK push sent successfully",
  "checkoutRequestId": "ws_CO_123456789",
  "amount": 100
}
```

**Validation:**
- Amount: 10 - 70,000 KES
- Rate Limit: 10 requests per minute

---

### 5. Get Deposit History
Retrieve user's deposit history.

**Endpoint:** `GET /api/deposits/history?limit=20&offset=0`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "deposits": [
    {
      "id": 1,
      "amount": 100,
      "status": "completed",
      "mpesaReceiptNumber": "QGH12345",
      "createdAt": "2026-01-15T10:30:00Z"
    }
  ],
  "total": 50
}
```

---

### 6. Get Deposit Statistics
Get user's deposit statistics.

**Endpoint:** `GET /api/deposits/stats`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "totalDeposits": 25,
  "totalAmount": 3500,
  "averageDeposit": 140,
  "thisMonth": {
    "deposits": 10,
    "amount": 1200
  },
  "consistencyScore": 85
}
```

---

## Wallet Endpoints

### 7. Get Wallet Balances
Retrieve all wallet balances.

**Endpoint:** `GET /api/wallet/balances`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "depositBalance": 1500,
  "salaryBalance": 3000,
  "bufferBalance": 200,
  "totalBalance": 4700,
  "lastUpdated": "2026-01-15T10:30:00Z"
}
```

---

### 8. Get Transaction History
Retrieve wallet transaction history.

**Endpoint:** `GET /api/wallet/transactions?limit=20&offset=0`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "transactions": [
    {
      "id": 1,
      "type": "deposit",
      "amount": 100,
      "reference": "QGH12345",
      "description": "M-Pesa deposit",
      "status": "completed",
      "createdAt": "2026-01-15T10:30:00Z"
    }
  ],
  "total": 100
}
```

---

## Third-Party Integration API (Requires API Key)

### 9. Get User by Phone Number
Retrieve user information.

**Endpoint:** `GET /api/v1/users/:phoneNumber`

**Headers:**
```
X-API-Key: <your-api-key>
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "phoneNumber": "254712345678",
    "firstName": "John",
    "lastName": "Doe",
    "targetSalary": 5000,
    "consistencyScore": 85,
    "wallet": {
      "depositBalance": 1500,
      "salaryBalance": 3000,
      "bufferBalance": 200
    }
  }
}
```

---

### 10. Get User Balance
Retrieve user's wallet balances.

**Endpoint:** `GET /api/v1/balance/:phoneNumber`

**Headers:**
```
X-API-Key: <your-api-key>
```

**Response:**
```json
{
  "phoneNumber": "254712345678",
  "balances": {
    "deposit": 1500,
    "salary": 3000,
    "buffer": 200,
    "total": 4700
  }
}
```

---

### 11. Get Transaction History
Retrieve user's transaction history.

**Endpoint:** `GET /api/v1/transactions/:phoneNumber?startDate=2026-01-01&endDate=2026-01-31&limit=50`

**Headers:**
```
X-API-Key: <your-api-key>
```

**Response:**
```json
{
  "phoneNumber": "254712345678",
  "transactions": [
    {
      "id": 1,
      "type": "deposit",
      "amount": 100,
      "reference": "QGH12345",
      "description": "M-Pesa deposit",
      "status": "completed",
      "createdAt": "2026-01-15T10:30:00Z"
    }
  ]
}
```

---

### 12. Get User Statistics
Retrieve user's deposit statistics.

**Endpoint:** `GET /api/v1/stats/:phoneNumber`

**Headers:**
```
X-API-Key: <your-api-key>
```

**Response:**
```json
{
  "phoneNumber": "254712345678",
  "stats": {
    "totalDeposits": 25,
    "totalAmount": 3500,
    "averageDeposit": 140,
    "consistencyScore": 85,
    "targetSalary": 5000,
    "currentProgress": "70.00"
  }
}
```

---

### 13. Webhook - External Deposit Notification
Notify PaySure of external deposits.

**Endpoint:** `POST /api/v1/webhook/deposit`

**Headers:**
```
X-API-Key: <your-api-key>
```

**Request Body:**
```json
{
  "phoneNumber": "254712345678",
  "amount": 100,
  "reference": "EXT123456",
  "source": "Partner System"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Deposit notification received",
  "reference": "EXT123456"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid phone number format (254XXXXXXXXX)"
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "error": "Invalid API key"
}
```

### 404 Not Found
```json
{
  "error": "User not found"
}
```

### 429 Too Many Requests
```json
{
  "error": "Too many requests, please try again later"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Phone Number Format
All phone numbers must be in Kenyan format:
- Format: `254XXXXXXXXX`
- Example: `254712345678`
- Safaricom: `2547XXXXXXXX` or `2541XXXXXXXX`

---

## Testing

### Demo User
```
Phone: 254712345678
OTP: Any 6-digit code (development mode)
```

### API Key (Development)
```
X-API-Key: paysure_api_integration_key_2026
```

### cURL Examples

**Send OTP:**
```bash
curl -X POST http://localhost:3000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "254712345678"}'
```

**Get User Balance (Integration API):**
```bash
curl -X GET http://localhost:3000/api/v1/balance/254712345678 \
  -H "X-API-Key: paysure_api_integration_key_2026"
```

---

## Security Best Practices

1. **Never expose API keys** in client-side code
2. **Use HTTPS** in production
3. **Rotate API keys** regularly
4. **Implement IP whitelisting** for integration endpoints
5. **Monitor rate limits** and adjust as needed
6. **Log all API access** for audit trails
7. **Validate all inputs** on both client and server
8. **Use environment variables** for sensitive configuration

---

## Support

For API access or integration support:
- Email: api@paysure.com
- Documentation: https://docs.paysure.com
