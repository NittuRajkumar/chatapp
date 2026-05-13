const { sequelize } = require('../models/index');

const syncDb = async () => {
  await sequelize.sync({ force: false });
  console.log('Database synced');
};

module.exports = syncDb;