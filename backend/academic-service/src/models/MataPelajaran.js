const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const MataPelajaran = sequelize.define('MataPelajaran', {
  id:            { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nama_mapel:    { type: DataTypes.STRING(20), allowNull: false, unique: true },
  kelas_id:      { type: DataTypes.INTEGER },
  guru_mapel_id: { type: DataTypes.UUID },
}, { tableName: 'mata_pelajaran', timestamps: false });

module.exports = MataPelajaran;