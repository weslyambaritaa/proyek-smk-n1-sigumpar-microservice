const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Siswa = sequelize.define('Siswa', {
  id:           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nisn:         { type: DataTypes.STRING(20), allowNull: false, unique: true },
  nama_lengkap: { type: DataTypes.STRING(150), allowNull: false },
  kelas_id:     { type: DataTypes.INTEGER },
}, { tableName: 'siswa', timestamps: false });

module.exports = Siswa;