const { Conversation, ConversationUser, User, Message } = require('../models/index');
const { Op } = require('sequelize');

const getConversations = async (req, res) => {
  try {
    const convUsers = await ConversationUser.findAll({ where: { userId: req.user.id } });
    const convIds = convUsers.map(c => c.conversationId);

    const conversations = await Conversation.findAll({
      where: { id: { [Op.in]: convIds } },
      include: [{ model: User, as: 'participants', attributes: ['id', 'username', 'avatarUrl', 'status'] }],
    });
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const createConversation = async (req, res) => {
  try {
    const { targetUserId } = req.body;
    if (!targetUserId) return res.status(400).json({ message: 'targetUserId required' });
    if (targetUserId === req.user.id) return res.status(400).json({ message: 'Cannot DM yourself' });

    const target = await User.findByPk(targetUserId);
    if (!target) return res.status(404).json({ message: 'User not found' });

    const myConvs = await ConversationUser.findAll({ where: { userId: req.user.id } });
    const myConvIds = myConvs.map(c => c.conversationId);
    const theirConvs = await ConversationUser.findAll({
      where: { userId: targetUserId, conversationId: { [Op.in]: myConvIds } },
    });
    if (theirConvs.length > 0) {
      const existing = await Conversation.findByPk(theirConvs[0].conversationId, {
        include: [{ model: User, as: 'participants', attributes: ['id', 'username', 'avatarUrl', 'status'] }],
      });
      return res.json(existing);
    }

    const conv = await Conversation.create({ createdById: req.user.id });
    await ConversationUser.bulkCreate([
      { userId: req.user.id, conversationId: conv.id },
      { userId: targetUserId, conversationId: conv.id },
    ]);

    const full = await Conversation.findByPk(conv.id, {
      include: [{ model: User, as: 'participants', attributes: ['id', 'username', 'avatarUrl', 'status'] }],
    });
    res.status(201).json(full);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getConversationMessages = async (req, res) => {
  try {
    const member = await ConversationUser.findOne({
      where: { conversationId: req.params.id, userId: req.user.id },
    });
    if (!member) return res.status(403).json({ message: 'Not a member of this conversation' });

    const { before, limit = 50 } = req.query;
    const where = { conversationId: req.params.id };
    if (before) where.id = { [Op.lt]: before };

    const messages = await Message.findAll({
      where,
      include: [{ model: User, as: 'sender', attributes: ['id', 'username', 'avatarUrl'] }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
    });
    res.json(messages.reverse());
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getConversations, createConversation, getConversationMessages };