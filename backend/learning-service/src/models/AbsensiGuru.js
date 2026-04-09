const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const AbsensiGuru = sequelize.define('AbsensiGuru', {
  id:             { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_absensiguru: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, unique: true },
  user_id:        { type: DataTypes.UUID, allowNull: false },
  nama_guru:      { type: DataTypes.STRING(255), allowNull: false, defaultValue: 'Unknown' },
  mata_pelajaran: { type: DataTypes.STRING(255), defaultValue: '-' },
  jam_masuk:      { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  tanggal:        { type: DataTypes.DATEONLY, allowNull: false },
  foto:           { type: DataTypes.TEXT },
  status: {
    type: DataTypes.STRING(20), allowNull: false, defaultValue: 'hadir',
    validate: { isIn: [['hadir', 'terlambat', 'izin', 'sakit', 'alpa']] },
  },
  keterangan: { type: DataTypes.TEXT },
  created_at:  { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at:  { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: 'absensi_guru',
  timestamps: false,
  indexes: [{ unique: true, fields: ['user_id', 'tanggal'] }],
});

module.exports = AbsensiGuru;