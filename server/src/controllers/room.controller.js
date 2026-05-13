const { Room, User, Message } = require('../models/index');
const { Op } = require('sequelize');

const getRooms = async (req, res) => {
  try {
    const { search } = req.query;
    const where = { isPublic: true };
    if (search) where.name = { [Op.like]: `%${search}%` };
    const rooms = await Room.findAll({
      where,
      include: [{ model: User, as: 'creator', attributes: ['id', 'username'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const createRoom = async (req, res) => {
  try {
    const { name, description, isPublic } = req.body;
    if (!name) return res.status(400).json({ message: 'Room name required' });

    const exists = await Room.findOne({ where: { name } });
    if (exists) return res.status(409).json({ message: 'Room name already taken' });

    const room = await Room.create({
      name,
      description: description || '',
      isPublic: isPublic !== undefined ? isPublic : true,
      createdById: req.user.id,
    });
    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getRoom = async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id, {
      include: [{ model: User, as: 'creator', attributes: ['id', 'username'] }],
    });
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getRoomMessages = async (req, res) => {
  try {
    const { before, limit = 50 } = req.query;
    const where = { roomId: req.params.id };
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

module.exports = { getRooms, createRoom, getRoom, getRoomMessages };