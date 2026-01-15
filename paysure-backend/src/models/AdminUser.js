const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AdminUser = sequelize.define('AdminUser', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  passwordHash: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('super_admin', 'admin', 'viewer'),
    defaultValue: 'viewer',
  },
  permissions: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  lastLoginAt: {
    type: DataTypes.DATE,
  },
}, {
  tableName: 'admin_users',
  timestamps: true,
});

module.exports = AdminUser;