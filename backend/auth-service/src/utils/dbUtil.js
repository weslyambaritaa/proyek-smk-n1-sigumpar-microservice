// File: src/utils/dbUtil.js
const { Sequelize } = require('sequelize');
const constUtil = require('./constUtil'); // Gunakan constUtil ala PPKHA

const sequelize = new Sequelize(
  constUtil.DB.NAME,
  constUtil.DB.USER,
  constUtil.DB.PASSWORD,
  {
    host: constUtil.DB.HOST,
    port: constUtil.DB.PORT,
    dialect: 'postgres',
    logging: false, 
  }
);

sequelize.authenticate()
  .then(() => console.log('Sequelize berhasil terhubung ke Keycloak DB!'))
  .catch((err) => console.error('Koneksi Sequelize gagal:', err));

module.exports = sequelize;