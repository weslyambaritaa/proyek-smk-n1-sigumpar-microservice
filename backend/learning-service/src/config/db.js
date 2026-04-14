const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST || "learning-db",
  user: process.env.DB_USER || "learning_user",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "learning_db",
  port: process.env.DB_PORT || 5432,
});

pool.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("Connected to Learning Database");
  }
});

module.exports = pool;