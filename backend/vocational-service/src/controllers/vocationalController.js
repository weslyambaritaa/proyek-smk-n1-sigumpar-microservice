// vocationalController.js
const db = require("../config/db");

// 1. Validasi & Menyetujui PKL
exports.approvePKL = async (req, res) => {
  const { pkl_id, status_kelayakan, catatan } = req.body; // status_kelayakan: 'layak' atau 'tidak'
  try {
    // Logika include: Jika layak, otomatis disetujui
    const status_akhir = status_kelayakan === "layak" ? "disetujui" : "ditolak";

    await db.query(
      "UPDATE pkl_submissions SET status_kelayakan = ?, status_approval = ?, catatan_guru = ? WHERE id = ?",
      [status_kelayakan, status_akhir, catatan, pkl_id],
    );
    res
      .status(200)
      .json({
        message: `PKL berhasil di-validasi sebagai ${status_kelayakan} dan status ${status_akhir}`,
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Monitoring & Memantau Progres
exports.updateMonitoring = async (req, res) => {
  const { pkl_id, catatan_kunjungan, progres_persen } = req.body;
  try {
    await db.query(
      "INSERT INTO pkl_monitoring (pkl_id, tanggal_kunjungan, catatan, progres_persen) VALUES (?, NOW(), ?, ?)",
      [pkl_id, catatan_kunjungan, progres_persen],
    );
    res
      .status(201)
      .json({ message: "Data monitoring dan progres berhasil dicatat" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. Fitur Nilai PKL (Input Nilai Akhir)
exports.inputNilaiPKL = async (req, res) => {
  const { pkl_id, nilai_angka, predikat, keterangan } = req.body;
  try {
    await db.query(
      "UPDATE pkl_submissions SET nilai_akhir = ?, predikat = ?, keterangan_nilai = ? WHERE id = ?",
      [nilai_angka, predikat, keterangan, pkl_id],
    );
    res.status(200).json({ message: "Nilai akhir PKL berhasil diinput" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
