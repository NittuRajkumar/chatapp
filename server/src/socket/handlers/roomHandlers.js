const { Message, Mention, User } = require('../../models/index');

const parseMentions = (content) => {
  const matches = content.match(/\B@(\w+)/g);
  return matches ? matches.map(m => m.slice(1)) : [];
};

module.exports = (io, socket) => {
  socket.on('room:join', (roomId) => {
    socket.join(`room:${roomId}`);
    socket.to(`room:${roomId}`).emit('room:user_joined', {
      roomId,
      user: { id: socket.user.id, username: socket.user.username },
    });
  });

  socket.on('room:leave', (roomId) => {
    socket.leave(`room:${roomId}`);
    socket.to(`room:${roomId}`).emit('room:user_left', {
      roomId,
      user: { id: socket.user.id, username: socket.user.username },
    });
  });

  socket.on('message:send', async ({ roomId, content }) => {
    try {
      if (!content || !content.trim()) return;

      const msg = await Message.create({
        content: content.trim(),
        senderId: socket.user.id,
        roomId,
      });

      const full = await Message.findByPk(msg.id, {
        include: [{ model: User, as: 'sender', attributes: ['id', 'username', 'avatarUrl'] }],
      });

      io.to(`room:${roomId}`).emit('message:new', full);

      const mentionedUsernames = parseMentions(content);
      if (mentionedUsernames.length > 0) {
        const mentionedUsers = await User.findAll({
          where: { username: mentionedUsernames },
          attributes: ['id', 'username'],
        });
        for (const u of mentionedUsers) {
          await Mention.create({ messageId: msg.id, mentionedUserId: u.id });
          io.to(`user:${u.id}`).emit('notification:mention', {
            message: full,
            roomId,
            mentionedBy: socket.user.username,
          });
        }
      }
    } catch (err) {
      socket.emit('error', { message: err.message });
    }
  });

  socket.on('message:edit', async ({ messageId, content }) => {
    try {
      const msg = await Message.findByPk(messageId);
      if (!msg || msg.senderId !== socket.user.id || msg.isDeleted) return;

      await msg.update({ content, isEdited: true });

      const full = await Message.findByPk(msg.id, {
        include: [{ model: User, as: 'sender', attributes: ['id', 'username', 'avatarUrl'] }],
      });

      const room = msg.roomId ? `room:${msg.roomId}` : `conv:${msg.conversationId}`;
      io.to(room).emit('message:edited', full);
    } catch (err) {
      socket.emit('error', { message: err.message });
    }
  });

  socket.on('message:delete', async ({ messageId }) => {
    try {
      const msg = await Message.findByPk(messageId);
      if (!msg || msg.senderId !== socket.user.id) return;

      await msg.update({ isDeleted: true, content: 'This message was deleted' });

      const room = msg.roomId ? `room:${msg.roomId}` : `conv:${msg.conversationId}`;
      io.to(room).emit('message:deleted', { id: messageId, isDeleted: true });
    } catch (err) {
      socket.emit('error', { message: err.message });
    }
  });

  socket.on('typing:start', ({ roomId }) => {
    socket.to(`room:${roomId}`).emit('typing:started', {
      roomId,
      user: { id: socket.user.id, username: socket.user.username },
    });
  });

  socket.on('typing:stop', ({ roomId }) => {
    socket.to(`room:${roomId}`).emit('typing:stopped', {
      roomId,
      userId: socket.user.id,
    });
  });
};