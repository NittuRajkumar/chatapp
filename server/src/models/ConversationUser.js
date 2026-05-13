const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ConversationUser = sequelize.define('ConversationUser', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  conversationId: { type: DataTypes.UUID, allowNull: false },
  lastReadAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

module.exports = ConversationUser;