const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Room = sequelize.define('Room', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false, unique: true },
  description: { type: DataTypes.STRING, defaultValue: '' },
  isPublic: { type: DataTypes.BOOLEAN, defaultValue: true },
  createdById: { type: DataTypes.UUID, allowNull: false },
});

module.exports = Room;