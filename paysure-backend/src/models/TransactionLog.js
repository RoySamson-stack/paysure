const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TransactionLog = sequelize.define('TransactionLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  transactionType: {
    type: DataTypes.ENUM('deposit', 'salary_transfer', 'buffer_transfer', 'payout'),
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  walletAffected: {
    type: DataTypes.ENUM('deposit', 'salary', 'buffer'),
    allowNull: false
  },
  previousBalance: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  newBalance: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  referenceId: {
    type: DataTypes.STRING
  },
  description: {
    type: DataTypes.TEXT
  }
}, {
  timestamps: true,
  tableName: 'transaction_logs'
});

module.exports = TransactionLog;
