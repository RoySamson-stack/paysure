const express = require('express');
const depositController = require('../controllers/depositController');
const authMiddleware = require('../middleware/auth');
const { depositLimiter } = require('../middleware/rateLimiter');
const { depositValidation } = require('../middleware/validation');

const router = express.Router();

router.post('/initiate', authMiddleware, depositLimiter, depositValidation, depositController.initiateDeposit);
router.post('/mpesa-callback', depositController.mpesaCallback);
router.get('/history', authMiddleware, depositController.getDepositHistory);
router.get('/stats', authMiddleware, depositController.getDepositStats);

module.exports = router;
