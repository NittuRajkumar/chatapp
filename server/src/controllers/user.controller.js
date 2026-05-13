const { User } = require('../models/index');
const { Op } = require('sequelize');

const getUsers = async (req, res) => {
  try {
    const { search } = req.query;
    const where = { id: { [Op.ne]: req.user.id } };
    if (search) where.username = { [Op.like]: `%${search}%` };

    const users = await User.findAll({
      where,
      attributes: ['id', 'username', 'avatarUrl', 'status', 'lastSeen'],
      order: [['username', 'ASC']],
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getUsers };