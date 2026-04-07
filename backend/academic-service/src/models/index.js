const sequelize = require('../config/db');
const { DataTypes } = require('sequelize');

// ─── KELAS ────────────────────────────────────────────────────────────────────
const Kelas = sequelize.define('Kelas', {
  id:           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nama_kelas:   { type: DataTypes.STRING(50), allowNull: false },
  tingkat:      { type: DataTypes.STRING(10) },
  wali_kelas_id:{ type: DataTypes.UUID },
}, { tableName: 'kelas', timestamps: false });

// ─── SISWA ───────────────────────────────────────────────────────────────────
const Siswa = sequelize.define('Siswa', {
  id:           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nisn:         { type: DataTypes.STRING(20), allowNull: false, unique: true },
  nama_lengkap: { type: DataTypes.STRING(150), allowNull: false },
  kelas_id:     { type: DataTypes.INTEGER, references: { model: 'kelas', key: 'id' } },
}, { tableName: 'siswa', timestamps: false });

// ─── GURU ────────────────────────────────────────────────────────────────────
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

// ─── MATA PELAJARAN ──────────────────────────────────────────────────────────
const MataPelajaran = sequelize.define('MataPelajaran', {
  id:           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nama_mapel:   { type: DataTypes.STRING(20), allowNull: false, unique: true },
  kelas_id:     { type: DataTypes.INTEGER, references: { model: 'kelas', key: 'id' } },
  guru_mapel_id:{ type: DataTypes.UUID },
}, { tableName: 'mata_pelajaran', timestamps: false });

// ─── NILAI SISWA ─────────────────────────────────────────────────────────────
const NilaiSiswa = sequelize.define('NilaiSiswa', {
  id:            { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  siswa_id:      { type: DataTypes.INTEGER, allowNull: false, references: { model: 'siswa', key: 'id' } },
  mapel_id:      { type: DataTypes.INTEGER, allowNull: false, references: { model: 'mata_pelajaran', key: 'id' } },
  kelas_id:      { type: DataTypes.INTEGER, allowNull: false, references: { model: 'kelas', key: 'id' } },
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

// ─── ABSENSI SISWA ───────────────────────────────────────────────────────────
const AbsensiSiswa = sequelize.define('AbsensiSiswa', {
  id:         { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  siswa_id:   { type: DataTypes.INTEGER, allowNull: false, references: { model: 'siswa', key: 'id' } },
  tanggal:    { type: DataTypes.DATEONLY, allowNull: false },
  mapel_id:   { type: DataTypes.INTEGER, references: { model: 'mata_pelajaran', key: 'id' } },
  status:     {
    type: DataTypes.STRING(20), allowNull: false,
    validate: { isIn: [['hadir', 'sakit', 'izin', 'alpa', 'terlambat']] },
  },
  keterangan: { type: DataTypes.TEXT },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'absensi_siswa', timestamps: false });

// ─── JADWAL MENGAJAR ─────────────────────────────────────────────────────────
const JadwalMengajar = sequelize.define('JadwalMengajar', {
  id:             { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  guru_id:        { type: DataTypes.UUID },
  kelas_id:       { type: DataTypes.INTEGER },
  mata_pelajaran: { type: DataTypes.STRING(100) },
  hari:           { type: DataTypes.STRING(20) },
  waktu_mulai:    { type: DataTypes.TIME },
  waktu_berakhir: { type: DataTypes.TIME },
}, { tableName: 'jadwal_mengajar', timestamps: false });

// ─── JADWAL PIKET ────────────────────────────────────────────────────────────
const JadwalPiket = sequelize.define('JadwalPiket', {
  id:      { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  tanggal: { type: DataTypes.DATEONLY },
  guru_id: { type: DataTypes.UUID },
}, { tableName: 'jadwal_piket', timestamps: false });

// ─── JADWAL UPACARA ──────────────────────────────────────────────────────────
const JadwalUpacara = sequelize.define('JadwalUpacara', {
  id:      { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  tanggal: { type: DataTypes.DATEONLY },
  petugas: { type: DataTypes.TEXT },
}, { tableName: 'jadwal_upacara', timestamps: false });

// ─── PENGUMUMAN ──────────────────────────────────────────────────────────────
const Pengumuman = sequelize.define('Pengumuman', {
  id:    { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  judul: { type: DataTypes.STRING(255) },
  isi:   { type: DataTypes.TEXT },
}, { tableName: 'pengumuman', timestamps: false });

// ─── ARSIP SURAT ─────────────────────────────────────────────────────────────
const ArsipSurat = sequelize.define('ArsipSurat', {
  id:           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nomor_surat:  { type: DataTypes.STRING(100) },
  file_url:     { type: DataTypes.TEXT },
}, { tableName: 'arsip_surat', timestamps: false });

// ─── PARENTING LOG ───────────────────────────────────────────────────────────
const ParentingLog = sequelize.define('ParentingLog', {
  id:             { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  kelas_id:       { type: DataTypes.INTEGER },
  wali_id:        { type: DataTypes.UUID },
  tanggal:        { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
  kehadiran_ortu: { type: DataTypes.INTEGER, defaultValue: 0 },
  agenda:         { type: DataTypes.STRING(255) },
  ringkasan:      { type: DataTypes.TEXT },
  foto_url:       { type: DataTypes.TEXT },
  created_at:     { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'parenting_log', timestamps: false });

// ─── WAKIL PROGRAM KERJA ─────────────────────────────────────────────────────
const WakilProgramKerja = sequelize.define('WakilProgramKerja', {
  id:                { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nama_program:      { type: DataTypes.STRING(200), allowNull: false },
  bidang:            { type: DataTypes.STRING(100), allowNull: false, defaultValue: 'Kurikulum' },
  tanggal_mulai:     { type: DataTypes.DATEONLY, allowNull: false },
  tanggal_selesai:   { type: DataTypes.DATEONLY },
  penanggung_jawab:  { type: DataTypes.STRING(150) },
  status:            {
    type: DataTypes.STRING(30), allowNull: false, defaultValue: 'belum_mulai',
    validate: { isIn: [['belum_mulai', 'sedang_berjalan', 'selesai', 'ditunda']] },
  },
  deskripsi:  { type: DataTypes.TEXT },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'wakil_program_kerja', timestamps: false });

// ─── WAKIL SUPERVISI ─────────────────────────────────────────────────────────
const WakilSupervisi = sequelize.define('WakilSupervisi', {
  id:              { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  guru_id:         { type: DataTypes.INTEGER, allowNull: false, references: { model: 'guru', key: 'id' } },
  tanggal:         { type: DataTypes.DATEONLY, allowNull: false },
  kelas:           { type: DataTypes.STRING(50) },
  mata_pelajaran:  { type: DataTypes.STRING(100) },
  aspek_penilaian: { type: DataTypes.TEXT },
  nilai:           { type: DataTypes.DECIMAL(5, 2), validate: { min: 0, max: 100 } },
  catatan:         { type: DataTypes.TEXT },
  rekomendasi:     { type: DataTypes.TEXT },
  created_at:      { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at:      { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'wakil_supervisi', timestamps: false });

// ─── WAKIL PERANGKAT PEMBELAJARAN ────────────────────────────────────────────
const WakilPerangkatPembelajaran = sequelize.define('WakilPerangkatPembelajaran', {
  id:             { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  guru_id:        { type: DataTypes.INTEGER, allowNull: false, references: { model: 'guru', key: 'id' } },
  nama_perangkat: { type: DataTypes.STRING(200), allowNull: false },
  jenis:          { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'RPP' },
  status:         {
    type: DataTypes.STRING(30), allowNull: false, defaultValue: 'belum_lengkap',
    validate: { isIn: [['lengkap', 'belum_lengkap']] },
  },
  catatan:    { type: DataTypes.TEXT },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'wakil_perangkat_pembelajaran', timestamps: false });

// ─── ASOSIASI ────────────────────────────────────────────────────────────────
Siswa.belongsTo(Kelas, { foreignKey: 'kelas_id', as: 'kelas' });
Kelas.hasMany(Siswa,   { foreignKey: 'kelas_id', as: 'siswa' });

MataPelajaran.belongsTo(Kelas, { foreignKey: 'kelas_id', as: 'kelas' });
Kelas.hasMany(MataPelajaran,   { foreignKey: 'kelas_id', as: 'mataPelajaran' });

NilaiSiswa.belongsTo(Siswa,         { foreignKey: 'siswa_id', as: 'siswa' });
NilaiSiswa.belongsTo(MataPelajaran, { foreignKey: 'mapel_id', as: 'mapel' });
NilaiSiswa.belongsTo(Kelas,         { foreignKey: 'kelas_id', as: 'kelas' });

AbsensiSiswa.belongsTo(Siswa,         { foreignKey: 'siswa_id', as: 'siswa' });
AbsensiSiswa.belongsTo(MataPelajaran, { foreignKey: 'mapel_id', as: 'mapel' });
AbsensiSiswa.belongsTo(Kelas,         { through: Siswa, foreignKey: 'kelas_id' });

JadwalMengajar.belongsTo(Kelas, { foreignKey: 'kelas_id', as: 'kelas' });

WakilSupervisi.belongsTo(Guru,            { foreignKey: 'guru_id', as: 'guru' });
WakilPerangkatPembelajaran.belongsTo(Guru,{ foreignKey: 'guru_id', as: 'guru' });

module.exports = {
  sequelize,
  Kelas,
  Siswa,
  Guru,
  MataPelajaran,
  NilaiSiswa,
  AbsensiSiswa,
  JadwalMengajar,
  JadwalPiket,
  JadwalUpacara,
  Pengumuman,
  ArsipSurat,
  ParentingLog,
  WakilProgramKerja,
  WakilSupervisi,
  WakilPerangkatPembelajaran,
};