const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Mention = sequelize.define('Mention', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  messageId: { type: DataTypes.UUID, allowNull: false },
  mentionedUserId: { type: DataTypes.UUID, allowNull: false },
});

module.exports = Mention;