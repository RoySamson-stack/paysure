const africastalking = require('africastalking');
const nodemailer = require('nodemailer');

// Initialize Africa's Talking
const atClient = africastalking({
  apiKey: process.env.AT_API_KEY,
  username: process.env.AT_USERNAME
});
const sms = atClient.SMS;

// Initialize Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// In-memory OTP storage (use Redis in production)
const otpStore = new Map();

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const otpService = {
  // Send SMS OTP
  sendPhoneOTP: async (phoneNumber) => {
    const otp = generateOTP();
    
    try {
      await sms.send({
        to: [phoneNumber],
        message: `Your PaySure verification code is: ${otp}. Valid for 5 minutes.`,
        from: process.env.AT_SENDER_ID || 'PaySure'
      });

      otpStore.set(phoneNumber, {
        otp,
        expiresAt: Date.now() + 5 * 60 * 1000
      });

      return { success: true, otp: process.env.NODE_ENV === 'development' ? otp : undefined };
    } catch (error) {
      console.error('SMS OTP Error:', error);
      throw new Error('Failed to send SMS OTP');
    }
  },

  // Send Email OTP
  sendEmailOTP: async (email) => {
    const otp = generateOTP();
    
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'PaySure Verification Code',
        html: `
          <h2>PaySure Verification</h2>
          <p>Your verification code is: <strong>${otp}</strong></p>
          <p>This code will expire in 5 minutes.</p>
        `
      });

      otpStore.set(email, {
        otp,
        expiresAt: Date.now() + 5 * 60 * 1000
      });

      return { success: true, otp: process.env.NODE_ENV === 'development' ? otp : undefined };
    } catch (error) {
      console.error('Email OTP Error:', error);
      throw new Error('Failed to send email OTP');
    }
  },

  // Verify OTP
  verifyOTP: (identifier, otp) => {
    const stored = otpStore.get(identifier);
    
    if (!stored || stored.expiresAt < Date.now()) {
      return { valid: false, error: 'OTP expired or invalid' };
    }

    if (stored.otp !== otp) {
      return { valid: false, error: 'Invalid OTP' };
    }

    otpStore.delete(identifier);
    return { valid: true };
  }
};

module.exports = otpService;
