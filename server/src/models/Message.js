const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Message = sequelize.define('Message', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  content: { type: DataTypes.TEXT, allowNull: false },
  senderId: { type: DataTypes.UUID, allowNull: false },
  roomId: { type: DataTypes.UUID, defaultValue: null },
  conversationId: { type: DataTypes.UUID, defaultValue: null },
  isEdited: { type: DataTypes.BOOLEAN, defaultValue: false },
  isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
  readAt: { type: DataTypes.DATE, defaultValue: null },
});

module.exports = Message;