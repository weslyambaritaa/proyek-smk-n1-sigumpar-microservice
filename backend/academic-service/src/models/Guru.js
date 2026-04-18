const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Guru = sequelize.define('Guru', {
  id:             { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nip:            { type: DataTypes.STRING(30), unique: true },
  nama_lengkap:   { type: DataTypes.STRING(150), allowNull: false },
  email:          { type: DataTypes.STRING(150) },
  jabatan:        { type: DataTypes.STRING(100) },
  mata_pelajaran: { type: DataTypes.STRING(150) },
  no_telepon:     { type: DataTypes.STRING(20) },
  created_at:     { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at:     { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'guru', timestamps: false });

module.exports = Guru;