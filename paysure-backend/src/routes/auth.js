const express = require('express');
const authController = require('../controllers/authController');
const { otpLimiter, authLimiter } = require('../middleware/rateLimiter');
const { phoneValidation, otpValidation, registrationValidation } = require('../middleware/validation');

const router = express.Router();

router.post('/send-otp', otpLimiter, phoneValidation, authController.sendOTP);
router.post('/verify-otp', authLimiter, otpValidation, authController.verifyOTP);
router.post('/complete-registration', authLimiter, registrationValidation, authController.completeRegistration);

module.exports = router;
