const academicClient = require("../utils/academicClient");
const pool = require("../config/db"); // database student-service
const { createError } = require("../middleware/errorHandler");

const isValidDate = (dateString) => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

exports.getRekapAbsensi = async (req, res, next) => {
  const { tanggal_awal, tanggal_akhir, id_kelas, id_mapel } = req.query;
  const token = req.headers.authorization;

  if (!tanggal_awal || !tanggal_akhir) {
    return next(
      createError(400, "Parameter tanggal_awal dan tanggal_akhir wajib diisi"),
    );
  }
  if (!isValidDate(tanggal_awal) || !isValidDate(tanggal_akhir)) {
    return next(createError(400, "Format tanggal harus YYYY-MM-DD"));
  }

  try {
    // 1. Ambil data siswa dari academic-service
    const siswaRes = await academicClient.get("/siswa", {
      headers: { Authorization: token },
    });
    let siswaList = siswaRes.data.data || [];

    // 2. Ambil data absensi
    const absensiRes = await academicClient.get("/absensi-siswa", {
      headers: { Authorization: token },
    });
    let absensiList = absensiRes.data.data || [];

    // Filter absensi berdasarkan rentang tanggal
    absensiList = absensiList.filter(
      (a) => a.tanggal >= tanggal_awal && a.tanggal <= tanggal_akhir,
    );

    // Filter siswa berdasarkan id_kelas
    if (id_kelas) {
      siswaList = siswaList.filter((s) => s.id_kelas == id_kelas);
    }

    // Jika ada id_mapel, kita perlu filter absensi berdasarkan mata pelajaran
    // Asumsi: data absensi memiliki field mata_pelajaran_id
    if (id_mapel) {
      absensiList = absensiList.filter((a) => a.mata_pelajaran_id == id_mapel);
    }

    // Agregasi per siswa
    const rekapMap = new Map();
    for (const siswa of siswaList) {
      rekapMap.set(siswa.id_siswa, {
        id_siswa: siswa.id_siswa,
        nama_siswa: siswa.namaSiswa || siswa.namasiswa,
        nis: siswa.NIS || siswa.nis,
        id_kelas: siswa.id_kelas,
        nama_kelas: siswa.nama_kelas || "-",
        hadir: 0,
        sakit: 0,
        izin: 0,
        alpa: 0,
        terlambat: 0,
        total_hari: 0,
      });
    }

    for (const absen of absensiList) {
      const id = absen.id_siswa;
      if (rekapMap.has(id)) {
        const entry = rekapMap.get(id);
        const status = absen.status;
        if (entry.hasOwnProperty(status)) entry[status]++;
        entry.total_hari++;
      }
    }

    // Simpan ke database student-service (opsional untuk caching)
    // Tabel rekap_absensi_siswa perlu dibuat di student-service
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      for (const [id_siswa, data] of rekapMap.entries()) {
        const persen =
          data.total_hari > 0
            ? ((data.hadir / data.total_hari) * 100).toFixed(2)
            : 0;
        const insertQuery = `
          INSERT INTO rekap_absensi_siswa 
          (id_siswa, nama_siswa, nis, id_kelas, nama_kelas, tanggal_awal, tanggal_akhir,
           hadir, sakit, izin, alpa, terlambat, total_hari, persentase_kehadiran)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
          ON CONFLICT (id_siswa, tanggal_awal, tanggal_akhir) DO UPDATE SET
            hadir = EXCLUDED.hadir, sakit = EXCLUDED.sakit, izin = EXCLUDED.izin,
            alpa = EXCLUDED.alpa, terlambat = EXCLUDED.terlambat,
            total_hari = EXCLUDED.total_hari, persentase_kehadiran = EXCLUDED.persentase_kehadiran,
            updated_at = NOW()
        `;
        await client.query(insertQuery, [
          id_siswa,
          data.nama_siswa,
          data.nis,
          data.id_kelas,
          data.nama_kelas,
          tanggal_awal,
          tanggal_akhir,
          data.hadir,
          data.sakit,
          data.izin,
          data.alpa,
          data.terlambat,
          data.total_hari,
          persen,
        ]);
      }
      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Gagal menyimpan rekap ke database:", err);
    } finally {
      client.release();
    }

    // Siapkan response
    const result = Array.from(rekapMap.values()).map((item) => ({
      ...item,
      persentase_kehadiran:
        item.total_hari > 0
          ? ((item.hadir / item.total_hari) * 100).toFixed(2)
          : "0.00",
    }));

    res.json({
      success: true,
      data: result,
      periode: { tanggal_awal, tanggal_akhir },
    });
  } catch (err) {
    next(err);
  }
};
