const { User, Deposit, SalaryPayout } = require('../models');
const { Op } = require('sequelize');
const walletService = require('./walletService');
const mpesaService = require('./mpesaService');

class SalaryService {
  async calculateMonthlySalary(userId, month, year) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const deposits = await Deposit.findAll({
      where: {
        userId,
        transactionStatus: 'completed',
        transactionDate: {
          [Op.between]: [startDate, endDate]
        }
      }
    });

    const totalDeposits = deposits.reduce((sum, deposit) => sum + parseFloat(deposit.amount), 0);
    const salaryGoal = parseFloat(user.monthlySalaryGoal);
    
    const salaryAmount = Math.min(totalDeposits, salaryGoal);
    const excessAmount = Math.max(0, totalDeposits - salaryGoal);

    return {
      totalDeposits,
      salaryAmount,
      excessAmount,
      salaryGoal,
      depositCount: deposits.length
    };
  }

  async processMonthlySalary(userId, month, year) {
    const calculation = await this.calculateMonthlySalary(userId, month, year);
    
    if (calculation.salaryAmount <= 0) {
      throw new Error('No salary to process');
    }

    // Transfer calculated salary to salary wallet
    await walletService.transferToSalaryWallet(
      userId, 
      calculation.salaryAmount, 
      `Monthly salary for ${month}/${year}`
    );

    // Transfer excess to buffer wallet if any
    if (calculation.excessAmount > 0) {
      await walletService.transferToBufferWallet(
        userId, 
        calculation.excessAmount, 
        `Excess deposits for ${month}/${year}`
      );
    }

    // Create salary payout record
    const salaryPayout = await SalaryPayout.create({
      userId,
      payoutMonth: month,
      payoutYear: year,
      expectedSalaryAmount: calculation.salaryAmount,
      payoutStatus: 'pending'
    });

    return salaryPayout;
  }

  async executeSalaryPayout(salaryPayoutId) {
    const salaryPayout = await SalaryPayout.findByPk(salaryPayoutId, {
      include: [{ model: User, as: 'user' }]
    });

    if (!salaryPayout) {
      throw new Error('Salary payout not found');
    }

    if (salaryPayout.payoutStatus !== 'pending') {
      throw new Error('Salary payout already processed');
    }

    try {
      // Update status to processing
      await salaryPayout.update({ payoutStatus: 'processing' });

      // Initiate M-Pesa B2C payment
      const mpesaResponse = await mpesaService.initiateB2C(
        salaryPayout.user.phoneNumber,
        salaryPayout.expectedSalaryAmount,
        `Salary payout for ${salaryPayout.payoutMonth}/${salaryPayout.payoutYear}`
      );

      // Process wallet payout
      await walletService.processSalaryPayout(
        salaryPayout.userId, 
        salaryPayout.expectedSalaryAmount
      );

      // Update payout record
      await salaryPayout.update({
        payoutStatus: 'completed',
        actualPaidAmount: salaryPayout.expectedSalaryAmount,
        payoutDate: new Date(),
        transactionReference: mpesaResponse.ConversationID
      });

      return salaryPayout;
    } catch (error) {
      await salaryPayout.update({ payoutStatus: 'failed' });
      throw error;
    }
  }

  async getSalaryHistory(userId, limit = 12) {
    return await SalaryPayout.findAll({
      where: { userId },
      order: [['payoutYear', 'DESC'], ['payoutMonth', 'DESC']],
      limit
    });
  }

  async getUpcomingPayout(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    
    const calculation = await this.calculateMonthlySalary(userId, currentMonth, currentYear);
    
    const nextPayoutDate = new Date(currentYear, currentMonth - 1, user.salaryPayoutDate);
    if (nextPayoutDate < now) {
      nextPayoutDate.setMonth(nextPayoutDate.getMonth() + 1);
    }

    return {
      nextPayoutDate,
      expectedAmount: calculation.salaryAmount,
      currentProgress: (calculation.totalDeposits / parseFloat(user.monthlySalaryGoal)) * 100,
      daysRemaining: Math.ceil((nextPayoutDate - now) / (1000 * 60 * 60 * 24))
    };
  }
}

module.exports = new SalaryService();
