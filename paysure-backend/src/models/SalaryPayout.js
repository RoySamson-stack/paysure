const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SalaryPayout = sequelize.define('SalaryPayout', {
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
  payoutMonth: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  payoutYear: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  expectedSalaryAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  actualPaidAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  payoutDate: {
    type: DataTypes.DATE
  },
  payoutStatus: {
    type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed'),
    defaultValue: 'pending'
  },
  transactionReference: {
    type: DataTypes.STRING
  }
}, {
  timestamps: true,
  tableName: 'salary_payouts'
});

module.exports = SalaryPayout;
