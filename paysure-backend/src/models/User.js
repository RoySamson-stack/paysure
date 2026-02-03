const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  idNumber: {
    type: DataTypes.STRING,
    allowNull: false
  },
  businessCategory: {
    type: DataTypes.STRING,
    allowNull: false
  },
  consentDataSharing: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  dailyDepositTarget: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  monthlySalaryGoal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  salaryPayoutDate: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  consistencyScore: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0
  },
  accountStatus: {
    type: DataTypes.ENUM('active', 'suspended', 'inactive'),
    defaultValue: 'active'
  },
  lastLoginAt: {
    type: DataTypes.DATE
  }
}, {
  timestamps: true,
  tableName: 'users'
});

module.exports = User;
