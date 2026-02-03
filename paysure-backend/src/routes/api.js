const express = require('express');
const router = express.Router();
const { apiKeyAuth } = require('../middleware/apiKeyAuth');
const { User, Wallet, Deposit, TransactionLog } = require('../models');
const { Op } = require('sequelize');

// All API routes require API key authentication
router.use(apiKeyAuth);

// Get user by phone number
router.get('/users/:phoneNumber', async (req, res) => {
  try {
    const user = await User.findOne({
      where: { phoneNumber: req.params.phoneNumber },
      include: [{ model: Wallet, as: 'wallet' }],
      attributes: { exclude: ['createdAt', 'updatedAt'] }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        firstName: user.firstName,
        lastName: user.lastName,
        targetSalary: user.targetSalary,
        consistencyScore: user.consistencyScore,
        wallet: user.wallet
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user balance
router.get('/balance/:phoneNumber', async (req, res) => {
  try {
    const user = await User.findOne({
      where: { phoneNumber: req.params.phoneNumber },
      include: [{ model: Wallet, as: 'wallet' }]
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      phoneNumber: user.phoneNumber,
      balances: {
        deposit: user.wallet.depositBalance,
        salary: user.wallet.salaryBalance,
        buffer: user.wallet.bufferBalance,
        total: parseFloat(user.wallet.depositBalance) + 
               parseFloat(user.wallet.salaryBalance) + 
               parseFloat(user.wallet.bufferBalance)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get transaction history
router.get('/transactions/:phoneNumber', async (req, res) => {
  try {
    const { startDate, endDate, limit = 50 } = req.query;
    
    const user = await User.findOne({
      where: { phoneNumber: req.params.phoneNumber }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const whereClause = { userId: user.id };
    
    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const transactions = await TransactionLog.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit)
    });

    res.json({
      phoneNumber: user.phoneNumber,
      transactions
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get deposit statistics
router.get('/stats/:phoneNumber', async (req, res) => {
  try {
    const user = await User.findOne({
      where: { phoneNumber: req.params.phoneNumber },
      include: [{ model: Wallet, as: 'wallet' }]
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const deposits = await Deposit.findAll({
      where: { 
        userId: user.id,
        status: 'completed'
      }
    });

    const totalDeposits = deposits.reduce((sum, d) => sum + parseFloat(d.amount), 0);
    const avgDeposit = deposits.length > 0 ? totalDeposits / deposits.length : 0;

    res.json({
      phoneNumber: user.phoneNumber,
      stats: {
        totalDeposits: deposits.length,
        totalAmount: totalDeposits,
        averageDeposit: avgDeposit,
        consistencyScore: user.consistencyScore,
        targetSalary: user.targetSalary,
        currentProgress: (totalDeposits / user.targetSalary * 100).toFixed(2)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Webhook for external deposit notifications
router.post('/webhook/deposit', async (req, res) => {
  try {
    const { phoneNumber, amount, reference, source } = req.body;

    if (!phoneNumber || !amount || !reference) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const user = await User.findOne({
      where: { phoneNumber }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Log the external deposit
    await TransactionLog.create({
      userId: user.id,
      type: 'deposit',
      amount,
      reference,
      description: `External deposit from ${source || 'API'}`,
      status: 'completed'
    });

    res.json({
      success: true,
      message: 'Deposit notification received',
      reference
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
