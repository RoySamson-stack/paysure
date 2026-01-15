const express = require('express');
const walletService = require('../services/walletService');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get wallet balances
router.get('/balances', authMiddleware, async (req, res) => {
  try {
    const wallet = await walletService.getWalletByUserId(req.user.id);
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    res.json({
      depositWallet: parseFloat(wallet.depositWalletBalance),
      salaryWallet: parseFloat(wallet.salaryWalletBalance),
      bufferWallet: parseFloat(wallet.bufferWalletBalance),
      totalBalance: parseFloat(wallet.depositWalletBalance) + 
                   parseFloat(wallet.salaryWalletBalance) + 
                   parseFloat(wallet.bufferWalletBalance),
      lastUpdated: wallet.lastUpdated
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get wallet balances' });
  }
});

// Get transaction history
router.get('/transactions', authMiddleware, async (req, res) => {
  try {
    const { walletType, limit = 50 } = req.query;
    const transactions = await walletService.getTransactionHistory(
      req.user.id, 
      walletType, 
      parseInt(limit)
    );

    res.json({ transactions });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get transaction history' });
  }
});

module.exports = router;
