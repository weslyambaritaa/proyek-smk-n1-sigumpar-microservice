// File: src/models/_index.js
const sequelize = require('../utils/dbUtil');
const UserModel = require('./UserModel');

// Ekspor semua model dari satu pintu
module.exports = {
  sequelize,
  UserModel
};