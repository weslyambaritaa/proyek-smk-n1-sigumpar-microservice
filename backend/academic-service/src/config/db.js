const { Sequelize, QueryTypes } = require('sequelize');
const sequelize = new Sequelize(
  process.env.DB_NAME || 'academic_db',
  process.env.DB_USER || 'academic_user',
  process.env.DB_PASSWORD || 'password',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    dialect: 'postgres',
    logging: false,
    pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
  }
);
sequelize.authenticate()
  .then(() => console.log('Koneksi Database Berhasil (Sequelize) — academic-service'))
  .catch(err => console.error('Koneksi Database Gagal:', err));

const runQuery = async (text, params, t) => {
  const trimmed = text.trim().toUpperCase();
  if (trimmed === 'BEGIN') {
    return;
  }
  if (trimmed === 'COMMIT') {
    if (t) await t.commit();
    return;
  }
  if (trimmed === 'ROLLBACK') {
    if (t) await t.rollback();
    return;
  }
  const isSelect = trimmed.startsWith('SELECT');
  const hasParams = Array.isArray(params) && params.length > 0;
  const opts = hasParams ? { bind: params, transaction: t } : { transaction: t };
  if (isSelect) {
    const rows = await sequelize.query(text, { ...opts, type: QueryTypes.SELECT });
    return { rows, rowCount: rows.length };
  }
  const [rows, meta] = await sequelize.query(text, { ...opts, type: QueryTypes.RAW });
  return { rows: rows || [], rowCount: meta?.rowCount || 0 };
};

const pool = {
  query: (text, params) => runQuery(text, params, null),
  connect: async () => {
    const t = await sequelize.transaction();
    return {
      query: (text, params) => runQuery(text, params, t),
      release: () => {},
    };
  },
};

module.exports = pool;
module.exports.sequelize = sequelize;