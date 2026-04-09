const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Lokasi tempat PKL siswa
const LaporanLokasiPKL = sequelize.define('LaporanLokasiPKL', {
  id:                  { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  siswa_id:            { type: DataTypes.STRING },   // UUID dari Keycloak (disimpan sebagai TEXT)
  nama_siswa:          { type: DataTypes.STRING(150) },
  nama_perusahaan:     { type: DataTypes.STRING(150), allowNull: false },
  alamat:              { type: DataTypes.TEXT },
  posisi:              { type: DataTypes.STRING(150) },
  deskripsi_pekerjaan: { type: DataTypes.TEXT },
  pembimbing_industri: { type: DataTypes.STRING(150) },
  kontak_pembimbing:   { type: DataTypes.STRING(100) },
  foto_url:            { type: DataTypes.TEXT },
  tanggal:             { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
  created_at:          { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'laporan_lokasi_pkl', timestamps: false });

// Laporan mingguan progres PKL siswa
const LaporanProgresPKL = sequelize.define('LaporanProgresPKL', {
  id:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  siswa_id:  { type: DataTypes.INTEGER },
  minggu_ke: { type: DataTypes.INTEGER },
  deskripsi: { type: DataTypes.TEXT },
}, { tableName: 'laporan_progres_pkl', timestamps: false });

// Nilai akhir PKL siswa dari guru vokasi
const NilaiPKL = sequelize.define('NilaiPKL', {
  id:            { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  siswa_id:      { type: DataTypes.INTEGER, allowNull: false },
  kelas_id:      { type: DataTypes.INTEGER },
  nama_siswa:    { type: DataTypes.STRING(150) },
  nilai_praktik: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
  nilai_sikap:   { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
  nilai_laporan: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
  created_at:    { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at:    { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: 'nilai_pkl',
  timestamps: false,
  indexes: [{ unique: true, fields: ['siswa_id', 'kelas_id'], name: 'unique_nilai_pkl' }],
});

module.exports = { LaporanLokasiPKL, LaporanProgresPKL, NilaiPKL };