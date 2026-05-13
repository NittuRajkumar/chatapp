const { verify } = require('../utils/jwt');
const { User } = require('../models/index');

const socketAuth = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('No token'));

    const decoded = verify(token);
    const user = await User.findByPk(decoded.id, {
      attributes: ['id', 'username', 'avatarUrl', 'status'],
    });
    if (!user) return next(new Error('User not found'));

    socket.user = user;
    next();
  } catch {
    next(new Error('Invalid token'));
  }
};

module.exports = socketAuth;