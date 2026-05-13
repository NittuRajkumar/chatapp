const { Message, ConversationUser, User } = require('../../models/index');

module.exports = (io, socket) => {
  socket.on('conv:join', (convId) => {
    socket.join(`conv:${convId}`);
  });

  socket.on('conv:leave', (convId) => {
    socket.leave(`conv:${convId}`);
  });

  socket.on('dm:send', async ({ conversationId, content }) => {
    try {
      if (!content || !content.trim()) return;

      const member = await ConversationUser.findOne({
        where: { conversationId, userId: socket.user.id },
      });
      if (!member) return;

      const msg = await Message.create({
        content: content.trim(),
        senderId: socket.user.id,
        conversationId,
      });

      const full = await Message.findByPk(msg.id, {
        include: [{ model: User, as: 'sender', attributes: ['id', 'username', 'avatarUrl'] }],
      });

      io.to(`conv:${conversationId}`).emit('message:new', full);
    } catch (err) {
      socket.emit('error', { message: err.message });
    }
  });

  socket.on('dm:typing:start', ({ conversationId }) => {
    socket.to(`conv:${conversationId}`).emit('typing:started', {
      conversationId,
      user: { id: socket.user.id, username: socket.user.username },
    });
  });

  socket.on('dm:typing:stop', ({ conversationId }) => {
    socket.to(`conv:${conversationId}`).emit('typing:stopped', {
      conversationId,
      userId: socket.user.id,
    });
  });

  socket.on('message:read', async ({ messageId, conversationId }) => {
    try {
      const msg = await Message.findByPk(messageId);
      if (!msg || msg.conversationId !== conversationId) return;

      await msg.update({ readAt: new Date() });
      await ConversationUser.update(
        { lastReadAt: new Date() },
        { where: { conversationId, userId: socket.user.id } }
      );

      socket.to(`conv:${conversationId}`).emit('message:read_receipt', {
        messageId,
        conversationId,
        readBy: socket.user.id,
        readAt: new Date(),
      });
    } catch (err) {
      socket.emit('error', { message: err.message });
    }
  });
};