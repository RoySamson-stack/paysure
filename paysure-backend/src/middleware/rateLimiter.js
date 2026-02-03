const rateLimit = require('express-rate-limit');

const createLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

const authLimiter = createLimiter(
  15 * 60 * 1000, // 15 minutes
  5, // 5 requests
  'Too many authentication attempts, please try again later'
);

const otpLimiter = createLimiter(
  15 * 60 * 1000,
  3,
  'Too many OTP requests, please try again later'
);

const depositLimiter = createLimiter(
  60 * 1000, // 1 minute
  10,
  'Too many deposit requests, please slow down'
);

const generalLimiter = createLimiter(
  parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
  parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  'Too many requests, please try again later'
);

module.exports = {
  authLimiter,
  otpLimiter,
  depositLimiter,
  generalLimiter
};
