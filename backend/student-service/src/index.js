const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME || "student_db",
  process.env.DB_USER || "student_user",
  process.env.DB_PASSWORD || "password",
  {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 5432),
    dialect: "postgres",
    logging: false,
  },
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Daftarkan model yang benar-benar ada di folder src/models
// Kalau nama file model Anda berbeda, sesuaikan require di bawah ini.
db.KebersihanKelas = require("./KebersihanKelas")(sequelize, DataTypes);
db.CatatanParenting = require("./CatatanParenting")(sequelize, DataTypes);
db.RefleksiWaliKelas = require("./RefleksiWaliKelas")(sequelize, DataTypes);
db.SuratPanggilan = require("./SuratPanggilan")(sequelize, DataTypes);
db.RekapKehadiran = require("./RekapKehadiran")(sequelize, DataTypes);
db.RekapNilai = require("./RekapNilai")(sequelize, DataTypes);

Object.keys(db).forEach((modelName) => {
  if (db[modelName] && typeof db[modelName].associate === "function") {
    db[modelName].associate(db);
  }
});

module.exports = db;
