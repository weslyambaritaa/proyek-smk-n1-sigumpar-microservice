const sequelize = require('../config/db');
const { DataTypes } = require('sequelize');

// ─── USERS ────────────────────────────────────────────────────────────────────
// Tabel ini menyimpan sinkronisasi akun dari Keycloak.
// id berupa UUID yang dikirim langsung dari Keycloak saat user pertama login.

const User = sequelize.define('User', {
  id:         { type: DataTypes.UUID, primaryKey: true },
  username:   { type: DataTypes.STRING(100), allowNull: false },
  email:      { type: DataTypes.STRING(100), allowNull: false, unique: true },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'users', timestamps: false });

module.exports = {
  sequelize,
  User,
};