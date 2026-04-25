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
    id: row.id,
    username: row.username,
    email: row.email,
    nama_lengkap: row.nama_lengkap || row.username,
    roles: row.roles || [],
  }));

const getAll = async (req, res, next) => {
  const { role } = req.query;

  try {
    const values = [];

    let roleFilter = "";
    if (role) {
      values.push(role);
      roleFilter = `
        HAVING $1 = ANY(array_remove(array_agg(DISTINCT kr.name), NULL))
      `;
    }

    const result = await pool.query(
      `
      SELECT
        ue.id,
        ue.username,
        ue.email,
        CASE
          WHEN ${displayNameSql} = '' THEN ue.username
          ELSE ${displayNameSql}
        END AS nama_lengkap,
        array_remove(array_agg(DISTINCT kr.name), NULL) AS roles
      FROM user_entity ue
      LEFT JOIN user_role_mapping urm ON urm.user_id = ue.id
      LEFT JOIN keycloak_role kr ON kr.id = urm.role_id
      GROUP BY
        ue.id,
        ue.username,
        ue.email,
        ue.first_name,
        ue.last_name
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
      roleFilter = `
        HAVING $3 = ANY(array_remove(array_agg(DISTINCT kr.name), NULL))
      `;
    }

    const result = await pool.query(
      `
      SELECT
        ue.id,
        ue.username,
        ue.email,
        CASE
          WHEN ${displayNameSql} = '' THEN ue.username
          ELSE ${displayNameSql}
        END AS nama_lengkap,
        array_remove(array_agg(DISTINCT kr.name), NULL) AS roles
      FROM user_entity ue
      LEFT JOIN user_role_mapping urm ON urm.user_id = ue.id
      LEFT JOIN keycloak_role kr ON kr.id = urm.role_id
      WHERE (
        $1 = '' OR
        ue.username ILIKE $2 OR
        ue.email ILIKE $2 OR
        ${displayNameSql} ILIKE $2
      )
      GROUP BY
        ue.id,
        ue.username,
        ue.email,
        ue.first_name,
        ue.last_name
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
