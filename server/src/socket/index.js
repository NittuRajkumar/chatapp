const { Server } = require('socket.io');
const socketAuth = require('./socketAuth');
const roomHandlers = require('./handlers/roomHandlers');
const dmHandlers = require('./handlers/dmHandlers');
const { User } = require('../models/index');

const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
  });

  io.use(socketAuth);

  io.on('connection', async (socket) => {
    const userId = socket.user.id;

    // join personal room for mentions/notifications
    socket.join(`user:${userId}`);

    // set user online
    await User.update({ status: 'online', lastSeen: new Date() }, { where: { id: userId } });
    io.emit('user:status', { userId, status: 'online' });

    console.log(`${socket.user.username} connected`);

    roomHandlers(io, socket);
    dmHandlers(io, socket);

    socket.on('disconnect', async () => {
      await User.update({ status: 'offline', lastSeen: new Date() }, { where: { id: userId } });
      io.emit('user:status', { userId, status: 'offline' });
      console.log(`${socket.user.username} disconnected`);
    });
  });

  return io;
};

module.exports = initSocket;