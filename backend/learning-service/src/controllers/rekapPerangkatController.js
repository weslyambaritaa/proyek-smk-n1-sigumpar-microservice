const pool = require("../config/db");

// GET /api/learning/rekap-perangkat?status=pending&jenis_dokumen=RPP
exports.getAllPerangkat = async (req, res) => {
  const { status, jenis_dokumen } = req.query;
  let query = `
    SELECT id, guru_id, nama_dokumen, jenis_dokumen, file_name, file_mime,
           status, feedback,
           to_char(tanggal_upload, 'YYYY-MM-DD') AS tanggal_upload,
           to_char(approved_at, 'YYYY-MM-DD') AS approved_at,
           approved_by
    FROM perangkat_pembelajaran
    WHERE 1=1
  `;
  const params = [];
  let idx = 1;

  if (status && ["pending", "approved", "rejected"].includes(status)) {
    query += ` AND status = $${idx++}`;
    params.push(status);
  }
  if (jenis_dokumen) {
    query += ` AND jenis_dokumen = $${idx++}`;
    params.push(jenis_dokumen);
  }
  query += ` ORDER BY tanggal_upload DESC`;

  try {
    const result = await pool.query(query, params);
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    console.error("[rekapPerangkat-getAll]", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/learning/rekap-perangkat/:id/download
exports.downloadPerangkat = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT file_name, file_data, file_mime FROM perangkat_pembelajaran WHERE id = $1`,
      [id],
    );
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Dokumen tidak ditemukan" });
    }
    const doc = result.rows[0];
    res.set("Content-Type", doc.file_mime);
    res.set("Content-Disposition", `attachment; filename="${doc.file_name}"`);
    res.send(doc.file_data);
  } catch (err) {
    console.error("[rekapPerangkat-download]", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/learning/rekap-perangkat/:id/approve
exports.approvePerangkat = async (req, res) => {
  const { id } = req.params;
  const kepalaSekolahId = req.user.sub;
  try {
    const result = await pool.query(
      `UPDATE perangkat_pembelajaran
       SET status = 'approved', approved_at = NOW(), approved_by = $1, feedback = NULL
       WHERE id = $2 AND status = 'pending'
       RETURNING id, status, approved_at`,
      [kepalaSekolahId, id],
    );
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Perangkat tidak ditemukan atau sudah diproses",
        });
    }
    res.json({
      success: true,
      message: "Perangkat disetujui",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("[approvePerangkat]", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/learning/rekap-perangkat/:id/reject
exports.rejectPerangkat = async (req, res) => {
  const { id } = req.params;
  const { feedback } = req.body;
  const kepalaSekolahId = req.user.sub;
  if (!feedback || feedback.trim() === "") {
    return res
      .status(400)
      .json({ success: false, message: "Feedback wajib diisi" });
  }
  try {
    const result = await pool.query(
      `UPDATE perangkat_pembelajaran
       SET status = 'rejected', feedback = $1, approved_at = NOW(), approved_by = $2
       WHERE id = $3 AND status = 'pending'
       RETURNING id, status, feedback`,
      [feedback.trim(), kepalaSekolahId, id],
    );
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Perangkat tidak ditemukan atau sudah diproses",
        });
    }
    res.json({
      success: true,
      message: "Perangkat ditolak",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("[rejectPerangkat]", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
