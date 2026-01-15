const { Deposit } = require('../models');
const { body, validationResult } = require('express-validator');
const mpesaService = require('../services/mpesaService');
const walletService = require('../services/walletService');

const depositController = {
  // Initiate deposit
  initiateDeposit: [
    body('amount').isFloat({ min: 1 }).withMessage('Valid amount is required'),
    
    async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        const { amount } = req.body;
        const userId = req.user.id;
        const phoneNumber = req.user.phoneNumber;

        // Create deposit record
        const deposit = await Deposit.create({
          userId,
          amount,
          transactionStatus: 'pending'
        });

        // Initiate M-Pesa STK Push
        const mpesaResponse = await mpesaService.initiateSTKPush(
          phoneNumber,
          amount,
          deposit.id
        );

        // Update deposit with M-Pesa reference
        await deposit.update({
          mpesaTransactionRef: mpesaResponse.CheckoutRequestID
        });

        res.json({
          message: 'Deposit initiated successfully',
          depositId: deposit.id,
          checkoutRequestId: mpesaResponse.CheckoutRequestID
        });
      } catch (error) {
        res.status(500).json({ error: 'Failed to initiate deposit' });
      }
    }
  ],

  // M-Pesa callback
  mpesaCallback: async (req, res) => {
    try {
      const { Body } = req.body;
      const { stkCallback } = Body;
      
      const checkoutRequestId = stkCallback.CheckoutRequestID;
      const resultCode = stkCallback.ResultCode;
      
      const deposit = await Deposit.findOne({
        where: { mpesaTransactionRef: checkoutRequestId }
      });

      if (!deposit) {
        return res.status(404).json({ error: 'Deposit not found' });
      }

      if (resultCode === 0) {
        // Payment successful
        const callbackMetadata = stkCallback.CallbackMetadata;
        const items = callbackMetadata.Item;
        
        const mpesaReceiptNumber = items.find(item => item.Name === 'MpesaReceiptNumber')?.Value;
        
        await deposit.update({
          transactionStatus: 'completed',
          mpesaTransactionRef: mpesaReceiptNumber
        });

        // Add to wallet
        await walletService.addDeposit(deposit.userId, deposit.amount, deposit.id);
      } else {
        // Payment failed
        await deposit.update({
          transactionStatus: 'failed'
        });
      }

      res.json({ message: 'Callback processed' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to process callback' });
    }
  },

  // Get deposit history
  getDepositHistory: async (req, res) => {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 20 } = req.query;
      
      const offset = (page - 1) * limit;
      
      const deposits = await Deposit.findAndCountAll({
        where: { userId },
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        deposits: deposits.rows,
        totalCount: deposits.count,
        currentPage: parseInt(page),
        totalPages: Math.ceil(deposits.count / limit)
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get deposit history' });
    }
  },

  // Get deposit statistics
  getDepositStats: async (req, res) => {
    try {
      const userId = req.user.id;
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const [monthlyDeposits, todayDeposits, totalDeposits] = await Promise.all([
        Deposit.findAll({
          where: {
            userId,
            transactionStatus: 'completed',
            transactionDate: { [require('sequelize').Op.gte]: startOfMonth }
          }
        }),
        Deposit.findAll({
          where: {
            userId,
            transactionStatus: 'completed',
            transactionDate: { [require('sequelize').Op.gte]: startOfDay }
          }
        }),
        Deposit.findAll({
          where: {
            userId,
            transactionStatus: 'completed'
          }
        })
      ]);

      const monthlyTotal = monthlyDeposits.reduce((sum, d) => sum + parseFloat(d.amount), 0);
      const todayTotal = todayDeposits.reduce((sum, d) => sum + parseFloat(d.amount), 0);
      const allTimeTotal = totalDeposits.reduce((sum, d) => sum + parseFloat(d.amount), 0);

      res.json({
        monthlyTotal,
        todayTotal,
        allTimeTotal,
        monthlyCount: monthlyDeposits.length,
        todayCount: todayDeposits.length,
        allTimeCount: totalDeposits.length
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get deposit statistics' });
    }
  }
};

module.exports = depositController;
