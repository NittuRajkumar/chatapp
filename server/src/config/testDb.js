const { Sequelize } = require('sequelize');

const testSequelize = new Sequelize({
  dialect: 'sqlite',
  storage: ':memory:',
  logging: false,
});

module.exports = testSequelize;