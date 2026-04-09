const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const NilaiSiswa = sequelize.define('NilaiSiswa', {
  id:            { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  siswa_id:      { type: DataTypes.INTEGER, allowNull: false },
  mapel_id:      { type: DataTypes.INTEGER, allowNull: false },
  kelas_id:      { type: DataTypes.INTEGER, allowNull: false },
  tahun_ajar:    { type: DataTypes.STRING(20), allowNull: false },
  nilai_tugas:   { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
  nilai_kuis:    { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
  nilai_uts:     { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
  nilai_uas:     { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
  nilai_praktik: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
  created_at:    { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at:    { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: 'nilai_siswa',
  timestamps: false,
  indexes: [{ unique: true, fields: ['siswa_id', 'mapel_id', 'kelas_id', 'tahun_ajar'], name: 'unique_nilai_siswa' }],
});

module.exports = NilaiSiswa;