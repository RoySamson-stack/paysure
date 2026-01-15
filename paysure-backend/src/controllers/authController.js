const jwt = require('jsonwebtoken');
const { User, Wallet } = require('../models');
const { body, validationResult } = require('express-validator');
const otpService = require('../services/otpService');

const authController = {
  // Send Phone OTP
  sendPhoneOTP: [
    body('phoneNumber').isMobilePhone().withMessage('Valid phone number is required'),
    
    async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        const { phoneNumber } = req.body;
        const result = await otpService.sendPhoneOTP(phoneNumber);

        res.json({ 
          message: 'OTP sent successfully',
          otp: result.otp
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    }
  ],

  // Send Email OTP
  sendEmailOTP: [
    body('email').isEmail().withMessage('Valid email is required'),
    
    async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        const { email } = req.body;
        const result = await otpService.sendEmailOTP(email);

        res.json({ 
          message: 'OTP sent successfully',
          otp: result.otp
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    }
  ],

  // Verify Phone OTP
  verifyPhoneOTP: [
    body('phoneNumber').isMobilePhone().withMessage('Valid phone number is required'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
    
    async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        const { phoneNumber, otp } = req.body;
        const verification = otpService.verifyOTP(phoneNumber, otp);

        if (!verification.valid) {
          return res.status(400).json({ error: verification.error });
        }

        let user = await User.findOne({ where: { phoneNumber } });
        const isNewUser = !user;

        const token = jwt.sign(
          { userId: user?.id || null, phoneNumber },
          process.env.JWT_SECRET,
          { expiresIn: '7d' }
        );

        res.json({
          token,
          isNewUser,
          user: user ? {
            id: user.id,
            phoneNumber: user.phoneNumber,
            fullName: user.fullName,
            accountStatus: user.accountStatus
          } : null
        });
      } catch (error) {
        res.status(500).json({ error: 'Failed to verify OTP' });
      }
    }
  ],

  // Verify Email OTP
  verifyEmailOTP: [
    body('email').isEmail().withMessage('Valid email is required'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
    
    async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        const { email, otp } = req.body;
        const verification = otpService.verifyOTP(email, otp);

        if (!verification.valid) {
          return res.status(400).json({ error: verification.error });
        }

        res.json({ message: 'Email verified successfully' });
      } catch (error) {
        res.status(500).json({ error: 'Failed to verify OTP' });
      }
    }
  ],

  // Complete registration
  completeRegistration: [
    body('fullName').notEmpty().withMessage('Full name is required'),
    body('idNumber').notEmpty().withMessage('ID number is required'),
    body('businessCategory').notEmpty().withMessage('Business category is required'),
    body('dailyDepositTarget').isFloat({ min: 1 }).withMessage('Valid daily deposit target is required'),
    body('monthlySalaryGoal').isFloat({ min: 1 }).withMessage('Valid monthly salary goal is required'),
    body('salaryPayoutDate').isInt({ min: 1, max: 31 }).withMessage('Valid payout date is required'),
    body('consentDataSharing').isBoolean().withMessage('Consent is required'),
    
    async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
          return res.status(401).json({ error: 'Token required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const {
          fullName,
          idNumber,
          businessCategory,
          dailyDepositTarget,
          monthlySalaryGoal,
          salaryPayoutDate,
          consentDataSharing
        } = req.body;

        const user = await User.create({
          phoneNumber: decoded.phoneNumber,
          fullName,
          idNumber,
          businessCategory,
          dailyDepositTarget,
          monthlySalaryGoal,
          salaryPayoutDate,
          consentDataSharing
        });

        // Create wallet for user
        await Wallet.create({ userId: user.id });

        // Generate new token with user ID
        const newToken = jwt.sign(
          { userId: user.id, phoneNumber: user.phoneNumber },
          process.env.JWT_SECRET,
          { expiresIn: '7d' }
        );

        res.status(201).json({
          token: newToken,
          user: {
            id: user.id,
            phoneNumber: user.phoneNumber,
            fullName: user.fullName,
            accountStatus: user.accountStatus
          }
        });
      } catch (error) {
        res.status(500).json({ error: 'Failed to complete registration' });
      }
    }
  ]
};

module.exports = authController;
