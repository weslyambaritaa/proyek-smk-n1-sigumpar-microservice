const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME     || 'academic_db',
  process.env.DB_USER     || 'academic_user',
  process.env.DB_PASSWORD || 'password',
  {
    host:    process.env.DB_HOST || 'localhost',
    port:    process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
  }
);

sequelize
  .authenticate()
  .then(() => console.log('Koneksi Database Berhasil (Sequelize)'))
  .catch((err) => console.error('Koneksi Database Gagal:', err));

module.exports = sequelize;