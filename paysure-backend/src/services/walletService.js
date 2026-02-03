const { Wallet, TransactionLog, Deposit } = require('../models');
const sequelize = require('../config/database');

class WalletService {
  async getWalletByUserId(userId) {
    return await Wallet.findOne({ where: { userId } });
  }

  async createWallet(userId) {
    return await Wallet.create({ userId });
  }

  async addDeposit(userId, amount, depositId) {
    const transaction = await sequelize.transaction();
    
    try {
      const wallet = await Wallet.findOne({ where: { userId }, transaction });
      if (!wallet) {
        throw new Error('Wallet not found');
      }

      const previousBalance = parseFloat(wallet.depositWalletBalance);
      const newBalance = previousBalance + parseFloat(amount);

      await wallet.update({
        depositWalletBalance: newBalance,
        lastUpdated: new Date()
      }, { transaction });

      await TransactionLog.create({
        userId,
        transactionType: 'deposit',
        amount,
        walletAffected: 'deposit',
        previousBalance,
        newBalance,
        referenceId: depositId,
        description: 'Deposit added to wallet'
      }, { transaction });

      await transaction.commit();
      return wallet;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async transferToSalaryWallet(userId, amount, description) {
    const transaction = await sequelize.transaction();
    
    try {
      const wallet = await Wallet.findOne({ where: { userId }, transaction });
      if (!wallet) {
        throw new Error('Wallet not found');
      }

      const depositBalance = parseFloat(wallet.depositWalletBalance);
      const salaryBalance = parseFloat(wallet.salaryWalletBalance);

      if (depositBalance < amount) {
        throw new Error('Insufficient deposit wallet balance');
      }

      const newDepositBalance = depositBalance - amount;
      const newSalaryBalance = salaryBalance + amount;

      await wallet.update({
        depositWalletBalance: newDepositBalance,
        salaryWalletBalance: newSalaryBalance,
        lastUpdated: new Date()
      }, { transaction });

      await TransactionLog.create({
        userId,
        transactionType: 'salary_transfer',
        amount,
        walletAffected: 'salary',
        previousBalance: salaryBalance,
        newBalance: newSalaryBalance,
        description
      }, { transaction });

      await transaction.commit();
      return wallet;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async transferToBufferWallet(userId, amount, description) {
    const transaction = await sequelize.transaction();
    
    try {
      const wallet = await Wallet.findOne({ where: { userId }, transaction });
      if (!wallet) {
        throw new Error('Wallet not found');
      }

      const depositBalance = parseFloat(wallet.depositWalletBalance);
      const bufferBalance = parseFloat(wallet.bufferWalletBalance);

      if (depositBalance < amount) {
        throw new Error('Insufficient deposit wallet balance');
      }

      const newDepositBalance = depositBalance - amount;
      const newBufferBalance = bufferBalance + amount;

      await wallet.update({
        depositWalletBalance: newDepositBalance,
        bufferWalletBalance: newBufferBalance,
        lastUpdated: new Date()
      }, { transaction });

      await TransactionLog.create({
        userId,
        transactionType: 'buffer_transfer',
        amount,
        walletAffected: 'buffer',
        previousBalance: bufferBalance,
        newBalance: newBufferBalance,
        description
      }, { transaction });

      await transaction.commit();
      return wallet;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async processSalaryPayout(userId, amount) {
    const transaction = await sequelize.transaction();
    
    try {
      const wallet = await Wallet.findOne({ where: { userId }, transaction });
      if (!wallet) {
        throw new Error('Wallet not found');
      }

      const salaryBalance = parseFloat(wallet.salaryWalletBalance);

      if (salaryBalance < amount) {
        throw new Error('Insufficient salary wallet balance');
      }

      const newSalaryBalance = salaryBalance - amount;

      await wallet.update({
        salaryWalletBalance: newSalaryBalance,
        lastUpdated: new Date()
      }, { transaction });

      await TransactionLog.create({
        userId,
        transactionType: 'payout',
        amount,
        walletAffected: 'salary',
        previousBalance: salaryBalance,
        newBalance: newSalaryBalance,
        description: 'Salary payout processed'
      }, { transaction });

      await transaction.commit();
      return wallet;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getTransactionHistory(userId, walletType = null, limit = 50) {
    const whereClause = { userId };
    if (walletType) {
      whereClause.walletAffected = walletType;
    }

    return await TransactionLog.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit
    });
  }
}

module.exports = new WalletService();
