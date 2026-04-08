// File: src/models/UserModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../utils/dbUtil');

const UserModel = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING, // <-- Pastikan kolom email ada karena dipanggil di getAll
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'users', // Nama asli tabel di PostgreSQL
  timestamps: true 
});

module.exports = UserModel;