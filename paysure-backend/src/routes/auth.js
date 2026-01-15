const express = require('express');
const authController = require('../controllers/authController');
const { otpLimiter, authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Phone OTP
router.post('/send-phone-otp', otpLimiter, authController.sendPhoneOTP);
router.post('/verify-phone-otp', authLimiter, authController.verifyPhoneOTP);

// Email OTP
router.post('/send-email-otp', otpLimiter, authController.sendEmailOTP);
router.post('/verify-email-otp', authLimiter, authController.verifyEmailOTP);

// Registration
router.post('/complete-registration', authLimiter, authController.completeRegistration);

module.exports = router;
