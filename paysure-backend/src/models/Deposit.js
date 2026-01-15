const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Deposit = sequelize.define('Deposit', {
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
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  transactionDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  paymentChannel: {
    type: DataTypes.STRING,
    defaultValue: 'M-Pesa'
  },
  mpesaTransactionRef: {
    type: DataTypes.STRING
  },
  transactionStatus: {
    type: DataTypes.ENUM('pending', 'completed', 'failed'),
    defaultValue: 'pending'
  }
}, {
  timestamps: true,
  tableName: 'deposits'
});

module.exports = Deposit;
