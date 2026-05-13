const sequelize = require('../config/database');
const User = require('./User');
const Room = require('./Room');
const Conversation = require('./Conversation');
const ConversationUser = require('./ConversationUser');
const Message = require('./Message');
const Mention = require('./Mention');

// User <-> Room
User.hasMany(Room, { foreignKey: 'createdById' });
Room.belongsTo(User, { foreignKey: 'createdById', as: 'creator' });

// User <-> Conversation (many-to-many through ConversationUser)
User.belongsToMany(Conversation, { through: ConversationUser, foreignKey: 'userId' });
Conversation.belongsToMany(User, { through: ConversationUser, foreignKey: 'conversationId', as: 'participants' });

// User <-> Message
User.hasMany(Message, { foreignKey: 'senderId' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });

// Room <-> Message
Room.hasMany(Message, { foreignKey: 'roomId' });
Message.belongsTo(Room, { foreignKey: 'roomId' });

// Conversation <-> Message
Conversation.hasMany(Message, { foreignKey: 'conversationId' });
Message.belongsTo(Conversation, { foreignKey: 'conversationId' });

// Message <-> Mention
Message.hasMany(Mention, { foreignKey: 'messageId' });
Mention.belongsTo(Message, { foreignKey: 'messageId' });

// User <-> Mention
User.hasMany(Mention, { foreignKey: 'mentionedUserId' });
Mention.belongsTo(User, { foreignKey: 'mentionedUserId', as: 'mentionedUser' });

module.exports = { sequelize, User, Room, Conversation, ConversationUser, Message, Mention };