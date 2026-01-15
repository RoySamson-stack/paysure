const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OTP = sequelize.define('OTP', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  phoneNumber: {
    type: DataTypes.STRING(15),
    allowNull: false,
  },
  otpCode: {
    type: DataTypes.STRING(6),
    allowNull: false,
  },
  purpose: {
    type: DataTypes.ENUM('registration', 'login', 'password_reset'),
    allowNull: false,
  },
  isUsed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: 'otps',
  timestamps: true,
});

module.exports = OTP;