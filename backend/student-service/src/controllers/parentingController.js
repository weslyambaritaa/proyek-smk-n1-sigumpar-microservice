const pool = require("../config/db");
const { createError } = require("../middleware/errorHandler");

const formatAttachmentUrl = (req, attachmentPath) => {
  if (!attachmentPath) return null;
  const normalized = attachmentPath.replace(/\\/g, "/");
  return `${req.protocol}://${req.get("host")}/${normalized}`;
};

const createParentingMeeting = async (req, res, next) => {
  try {
    const {
      kelas,
      wali_kelas,
      meeting_date,
      attendance_count,
      attendance_label,
      agenda,
      summary,
    } = req.body;

    if (!kelas || !meeting_date || !agenda) {
      throw createError(400, "kelas, meeting_date, dan agenda wajib diisi");
    }

    const file = req.file || null;
    const attachment_name = file ? file.originalname : null;
    const attachment_path = file ? `uploads/parenting/${file.filename}` : null;

    const result = await pool.query(
      `
      INSERT INTO parenting_meetings
        (
          kelas,
          wali_kelas,
          meeting_date,
          attendance_count,
          attendance_label,
          agenda,
          summary,
          attachment_name,
          attachment_path
        )
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
      `,
      [
        kelas,
        wali_kelas || null,
        meeting_date,
        Number(attendance_count || 0),
        attendance_label || null,
        agenda,
        summary || null,
        attachment_name,
        attachment_path,
      ]
    );

    const data = result.rows[0];

    res.status(201).json({
      success: true,
      message: "Laporan parenting berhasil disimpan",
      data: {
        ...data,
        attachment_url: formatAttachmentUrl(req, data.attachment_path),
      },
    });
  } catch (err) {
    next(err);
  }
};

const getAllParentingMeetings = async (req, res, next) => {
  try {
    const { kelas, search } = req.query;

    let query = `
      SELECT *
      FROM parenting_meetings
      WHERE 1=1
    `;
    const values = [];
    let idx = 1;

    if (kelas) {
      query += ` AND kelas = $${idx++}`;
      values.push(kelas);
    }

    if (search) {
      query += ` AND (
        LOWER(COALESCE(agenda, '')) LIKE LOWER($${idx})
        OR LOWER(COALESCE(summary, '')) LIKE LOWER($${idx})
      )`;
      values.push(`%${search}%`);
      idx++;
    }

    query += ` ORDER BY meeting_date DESC, id DESC`;

    const result = await pool.query(query, values);

    const data = result.rows.map((item) => ({
      ...item,
      attachment_url: formatAttachmentUrl(req, item.attachment_path),
    }));

    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};

const getParentingMeetingById = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT * FROM parenting_meetings WHERE id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      throw createError(404, `Data parenting dengan ID '${req.params.id}' tidak ditemukan`);
    }

    const data = result.rows[0];

    res.status(200).json({
      success: true,
      data: {
        ...data,
        attachment_url: formatAttachmentUrl(req, data.attachment_path),
      },
    });
  } catch (err) {
    next(err);
  }
};

const updateParentingMeeting = async (req, res, next) => {
  try {
    const existing = await pool.query(
      `SELECT * FROM parenting_meetings WHERE id = $1`,
      [req.params.id]
    );

    if (existing.rows.length === 0) {
      throw createError(404, `Data parenting dengan ID '${req.params.id}' tidak ditemukan`);
    }

    const current = existing.rows[0];
    const file = req.file || null;

    const updated = {
      kelas: req.body.kelas || current.kelas,
      wali_kelas: req.body.wali_kelas ?? current.wali_kelas,
      meeting_date: req.body.meeting_date || current.meeting_date,
      attendance_count:
        req.body.attendance_count !== undefined
          ? Number(req.body.attendance_count)
          : current.attendance_count,
      attendance_label: req.body.attendance_label ?? current.attendance_label,
      agenda: req.body.agenda || current.agenda,
      summary: req.body.summary ?? current.summary,
      attachment_name: file ? file.originalname : current.attachment_name,
      attachment_path: file
        ? `uploads/parenting/${file.filename}`
        : current.attachment_path,
    };

    const result = await pool.query(
      `
      UPDATE parenting_meetings
      SET
        kelas = $1,
        wali_kelas = $2,
        meeting_date = $3,
        attendance_count = $4,
        attendance_label = $5,
        agenda = $6,
        summary = $7,
        attachment_name = $8,
        attachment_path = $9
      WHERE id = $10
      RETURNING *
      `,
      [
        updated.kelas,
        updated.wali_kelas,
        updated.meeting_date,
        updated.attendance_count,
        updated.attendance_label,
        updated.agenda,
        updated.summary,
        updated.attachment_name,
        updated.attachment_path,
        req.params.id,
      ]
    );

    const data = result.rows[0];

    res.status(200).json({
      success: true,
      message: "Data parenting berhasil diperbarui",
      data: {
        ...data,
        attachment_url: formatAttachmentUrl(req, data.attachment_path),
      },
    });
  } catch (err) {
    next(err);
  }
};

const deleteParentingMeeting = async (req, res, next) => {
  try {
    const result = await pool.query(
      `DELETE FROM parenting_meetings WHERE id = $1 RETURNING *`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      throw createError(404, `Data parenting dengan ID '${req.params.id}' tidak ditemukan`);
    }

    res.status(200).json({
      success: true,
      message: "Data parenting berhasil dihapus",
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createParentingMeeting,
  getAllParentingMeetings,
  getParentingMeetingById,
  updateParentingMeeting,
  deleteParentingMeeting,
};