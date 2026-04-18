const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Pengumuman = sequelize.define('Pengumuman', {
  id:    { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  judul: { type: DataTypes.STRING(255) },
  isi:   { type: DataTypes.TEXT },
}, { tableName: 'pengumuman', timestamps: false });

const ArsipSurat = sequelize.define('ArsipSurat', {
  id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nomor_surat: { type: DataTypes.STRING(100) },
  file_url:    { type: DataTypes.TEXT },
}, { tableName: 'arsip_surat', timestamps: false });

module.exports = { Pengumuman, ArsipSurat };