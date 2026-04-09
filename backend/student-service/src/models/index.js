const sequelize = require('../config/db');

const User = require('./User');

module.exports = {
  sequelize,
  User,
};