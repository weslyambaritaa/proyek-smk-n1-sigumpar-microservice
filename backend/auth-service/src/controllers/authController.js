const pool = require("../config/db");

const displayNameSql = `
  TRIM(
    COALESCE(NULLIF(ue.first_name, ''), '') ||
    CASE
      WHEN COALESCE(NULLIF(ue.first_name, ''), '') <> ''
       AND COALESCE(NULLIF(ue.last_name, ''), '') <> ''
      THEN ' '
      ELSE ''
    END ||
    COALESCE(NULLIF(ue.last_name, ''), '')
  )
`;

const normalizeUserRows = (rows) =>
  rows.map((row) => ({
    ...row,
    nama_lengkap: row.nama_lengkap || row.username,
  }));

const getAll = async (req, res, next) => {
  const { role } = req.query;

  try {
    const values = [];
    let roleFilter = "";

    if (role) {
      values.push(role);
      roleFilter = `WHERE kr.name = $1`;
    }

    const result = await pool.query(
      `
      SELECT DISTINCT
        ue.id,
        ue.username,
        ue.email,
        CASE
          WHEN ${displayNameSql} = '' THEN ue.username
          ELSE ${displayNameSql}
        END AS nama_lengkap,
        kr.name AS role
      FROM user_entity ue
      LEFT JOIN user_role_mapping urm ON urm.user_id = ue.id
      LEFT JOIN keycloak_role kr ON kr.id = urm.role_id
      ${roleFilter}
      ORDER BY nama_lengkap ASC
      `,
      values,
    );

    res.json({
      success: true,
      data: normalizeUserRows(result.rows),
    });
  } catch (err) {
    console.error("getAll users error:", err);
    next(err);
  }
};

const searchUsers = async (req, res, next) => {
  const { q = "", role } = req.query;

  try {
    const values = [q, `%${q}%`];

    let roleFilter = "";
    if (role) {
      values.push(role);
      roleFilter = `AND kr.name = $3`;
    }

    const result = await pool.query(
      `
      SELECT DISTINCT
        ue.id,
        ue.username,
        ue.email,
        CASE
          WHEN ${displayNameSql} = '' THEN ue.username
          ELSE ${displayNameSql}
        END AS nama_lengkap,
        kr.name AS role
      FROM user_entity ue
      LEFT JOIN user_role_mapping urm ON urm.user_id = ue.id
      LEFT JOIN keycloak_role kr ON kr.id = urm.role_id
      WHERE (
        $1 = '' OR
        ue.username ILIKE $2 OR
        ue.email ILIKE $2 OR
        ${displayNameSql} ILIKE $2
      )
      ${roleFilter}
      ORDER BY nama_lengkap ASC
      LIMIT 20
      `,
      values,
    );

    res.json({
      success: true,
      data: normalizeUserRows(result.rows),
    });
  } catch (err) {
    console.error("searchUsers error:", err);
    next(err);
  }
};

const syncUserFromToken = async () => {
  return true;
};

module.exports = {
  getAll,
  searchUsers,
  syncUserFromToken,
};
