const sequelize = require('../config/db');

const Kelas         = require('./Kelas');
const Siswa         = require('./Siswa');
const Guru          = require('./Guru');
const MataPelajaran = require('./MataPelajaran');
const NilaiSiswa    = require('./NilaiSiswa');
const AbsensiSiswa  = require('./AbsensiSiswa');
const { JadwalMengajar, JadwalPiket, JadwalUpacara }                    = require('./Jadwal');
const { Pengumuman, ArsipSurat }                                        = require('./Informasi');
const { ParentingLog }                                                  = require('./WaliKelas');
const { WakilProgramKerja, WakilSupervisi, WakilPerangkatPembelajaran } = require('./WakilKepsek');

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

JadwalMengajar.belongsTo(Kelas, { foreignKey: 'kelas_id', as: 'kelas' });

WakilSupervisi.belongsTo(Guru,             { foreignKey: 'guru_id', as: 'guru' });
WakilPerangkatPembelajaran.belongsTo(Guru, { foreignKey: 'guru_id', as: 'guru' });

// ─── EKSPOR ──────────────────────────────────────────────────────────────────

module.exports = {
  sequelize,
  Kelas, Siswa, Guru, MataPelajaran,
  NilaiSiswa, AbsensiSiswa,
  JadwalMengajar, JadwalPiket, JadwalUpacara,
  Pengumuman, ArsipSurat,
  ParentingLog,
  WakilProgramKerja, WakilSupervisi, WakilPerangkatPembelajaran,
};