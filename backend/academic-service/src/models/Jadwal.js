const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const JadwalMengajar = sequelize.define('JadwalMengajar', {
  id:             { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  guru_id:        { type: DataTypes.UUID },
  kelas_id:       { type: DataTypes.INTEGER },
  mata_pelajaran: { type: DataTypes.STRING(100) },
  hari:           { type: DataTypes.STRING(20) },
  waktu_mulai:    { type: DataTypes.TIME },
  waktu_berakhir: { type: DataTypes.TIME },
}, { tableName: 'jadwal_mengajar', timestamps: false });

const JadwalPiket = sequelize.define('JadwalPiket', {
  id:      { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  tanggal: { type: DataTypes.DATEONLY },
  guru_id: { type: DataTypes.UUID },
}, { tableName: 'jadwal_piket', timestamps: false });

const JadwalUpacara = sequelize.define('JadwalUpacara', {
  id:      { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  tanggal: { type: DataTypes.DATEONLY },
  petugas: { type: DataTypes.TEXT },
}, { tableName: 'jadwal_upacara', timestamps: false });

module.exports = { JadwalMengajar, JadwalPiket, JadwalUpacara };