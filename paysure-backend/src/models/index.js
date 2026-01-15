const User = require('./User');
const Wallet = require('./Wallet');
const Deposit = require('./Deposit');
const SalaryPayout = require('./SalaryPayout');
const TransactionLog = require('./TransactionLog');

// Define associations
User.hasOne(Wallet, { foreignKey: 'userId', as: 'wallet' });
Wallet.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Deposit, { foreignKey: 'userId', as: 'deposits' });
Deposit.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(SalaryPayout, { foreignKey: 'userId', as: 'salaryPayouts' });
SalaryPayout.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(TransactionLog, { foreignKey: 'userId', as: 'transactionLogs' });
TransactionLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
  User,
  Wallet,
  Deposit,
  SalaryPayout,
  TransactionLog
};
