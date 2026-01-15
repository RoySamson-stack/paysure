const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const phoneValidation = [
  body('phoneNumber')
    .matches(/^254[17]\d{8}$/)
    .withMessage('Invalid Kenyan phone number format (254XXXXXXXXX)'),
  validate
];

const otpValidation = [
  body('phoneNumber').matches(/^254[17]\d{8}$/),
  body('otp').isLength({ min: 6, max: 6 }).isNumeric(),
  validate
];

const depositValidation = [
  body('amount')
    .isFloat({ min: 10, max: 70000 })
    .withMessage('Amount must be between KES 10 and 70,000'),
  validate
];

const registrationValidation = [
  body('firstName').trim().isLength({ min: 2, max: 50 }).escape(),
  body('lastName').trim().isLength({ min: 2, max: 50 }).escape(),
  body('targetSalary').isFloat({ min: 100, max: 100000 }),
  body('payoutDay').isInt({ min: 1, max: 28 }),
  validate
];

module.exports = {
  phoneValidation,
  otpValidation,
  depositValidation,
  registrationValidation
};
