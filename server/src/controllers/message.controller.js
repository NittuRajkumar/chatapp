const { Message, Mention, User } = require('../models/index');

const editMessage = async (req, res) => {
  try {
    const msg = await Message.findByPk(req.params.id);
    if (!msg) return res.status(404).json({ message: 'Message not found' });
    if (msg.senderId !== req.user.id) return res.status(403).json({ message: 'Not your message' });
    if (msg.isDeleted) return res.status(400).json({ message: 'Cannot edit deleted message' });

    const { content } = req.body;
    if (!content) return res.status(400).json({ message: 'Content required' });

    await msg.update({ content, isEdited: true });

    const updated = await Message.findByPk(msg.id, {
      include: [{ model: User, as: 'sender', attributes: ['id', 'username', 'avatarUrl'] }],
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const msg = await Message.findByPk(req.params.id);
    if (!msg) return res.status(404).json({ message: 'Message not found' });
    if (msg.senderId !== req.user.id) return res.status(403).json({ message: 'Not your message' });

    await msg.update({ isDeleted: true, content: 'This message was deleted' });
    res.json({ id: msg.id, isDeleted: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { editMessage, deleteMessage };