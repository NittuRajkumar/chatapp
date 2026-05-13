const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  username: { type: DataTypes.STRING, allowNull: false, unique: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  passwordHash: { type: DataTypes.STRING, allowNull: false },
  avatarUrl: { type: DataTypes.STRING, defaultValue: null },
  status: { type: DataTypes.ENUM('online', 'offline', 'away'), defaultValue: 'offline' },
  lastSeen: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

module.exports = User;