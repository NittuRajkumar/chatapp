const bcrypt = require('bcryptjs');
const { User } = require('../models/index');
const { sign } = require('../utils/jwt');

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields required' });
    }

    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(409).json({ message: 'Email already registered' });

    const usernameExists = await User.findOne({ where: { username } });
    if (usernameExists) return res.status(409).json({ message: 'Username taken' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, passwordHash });

    const token = sign({ id: user.id, username: user.username });
    res.status(201).json({
      token,
      user: { id: user.id, username: user.username, email: user.email, avatarUrl: user.avatarUrl },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'All fields required' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    await user.update({ status: 'online', lastSeen: new Date() });

    const token = sign({ id: user.id, username: user.username });
    res.json({
      token,
      user: { id: user.id, username: user.username, email: user.email, avatarUrl: user.avatarUrl, status: user.status },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const logout = async (req, res) => {
  try {
    await User.update({ status: 'offline', lastSeen: new Date() }, { where: { id: req.user.id } });
    res.json({ message: 'Logged out' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const me = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'username', 'email', 'avatarUrl', 'status', 'lastSeen'],
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { register, login, logout, me };