# OTP Implementation Guide

## Installation

```bash
npm install africastalking nodemailer
```

## API Endpoints

### Phone OTP
- **Send OTP**: `POST /api/auth/send-phone-otp`
  ```json
  { "phoneNumber": "+254712345678" }
  ```

- **Verify OTP**: `POST /api/auth/verify-phone-otp`
  ```json
  { 
    "phoneNumber": "+254712345678",
    "otp": "123456"
  }
  ```

### Email OTP
- **Send OTP**: `POST /api/auth/send-email-otp`
  ```json
  { "email": "user@example.com" }
  ```

- **Verify OTP**: `POST /api/auth/verify-email-otp`
  ```json
  { 
    "email": "user@example.com",
    "otp": "123456"
  }
  ```

## Configuration

### 1. Africa's Talking (SMS)
1. Sign up at https://africastalking.com
2. Get API key from dashboard
3. Update `.env`:
   ```
   AT_API_KEY=your_api_key
   AT_USERNAME=sandbox (or your username)
   AT_SENDER_ID=PaySure
   ```

### 2. Gmail (Email)
1. Enable 2FA on your Gmail account
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Update `.env`:
   ```
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_16_char_app_password
   ```

## Testing

In development mode, OTP is returned in the response:
```json
{
  "message": "OTP sent successfully",
  "otp": "123456"
}
```

In production, OTP is only sent via SMS/Email.

## Features
- 6-digit OTP generation
- 5-minute expiry
- Rate limiting (3 attempts per 15 minutes)
- Automatic cleanup after verification
- Development mode shows OTP in response
