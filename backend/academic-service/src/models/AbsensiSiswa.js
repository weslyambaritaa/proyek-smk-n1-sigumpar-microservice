const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const AbsensiSiswa = sequelize.define('AbsensiSiswa', {
  id:         { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  siswa_id:   { type: DataTypes.INTEGER, allowNull: false },
  tanggal:    { type: DataTypes.DATEONLY, allowNull: false },
  mapel_id:   { type: DataTypes.INTEGER },
  status: {
    type: DataTypes.STRING(20), allowNull: false,
    validate: { isIn: [['hadir', 'sakit', 'izin', 'alpa', 'terlambat']] },
  },
  keterangan: { type: DataTypes.TEXT },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'absensi_siswa', timestamps: false });

module.exports = AbsensiSiswa;