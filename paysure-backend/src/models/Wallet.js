const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Wallet = sequelize.define('Wallet', {
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
  depositWalletBalance: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  salaryWalletBalance: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  bufferWalletBalance: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  lastUpdated: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: true,
  tableName: 'wallets'
});

module.exports = Wallet;
