const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const MataPelajaran = sequelize.define('MataPelajaran', {
  id:            { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nama_mapel:    { type: DataTypes.STRING(100), allowNull: false, unique: true }, // diperbesar dari 20 → 100
  kelas_id:      { type: DataTypes.INTEGER },
  guru_mapel_id: { type: DataTypes.INTEGER }, // diubah dari UUID → INTEGER (sesuai guru.id)
}, { tableName: 'mata_pelajaran', timestamps: false });

module.exports = MataPelajaran;