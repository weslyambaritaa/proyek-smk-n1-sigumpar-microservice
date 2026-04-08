const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const authRoutes = require('./routes/authRoutes');
const { errorHandler } = require("./middleware/errorHandler");
require('dotenv').config();
const constUtil = require('./utils/constUtil');

const app = express();
// Ambil port secara dinamis
const PORT = constUtil.APP.PORT;
app.listen(PORT, () => {
  console.log(`Auth Service berjalan di port ${PORT}`);
});

// Middleware global (identik dengan users-service)
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "todos-service",
    timestamp: new Date().toISOString(),
  });
});

// Mount routes
app.use('/api/auth', authRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route '${req.originalUrl}' tidak ditemukan`,
  });
});

// Error handler (selalu di akhir)
app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Auth Service running on port ${PORT} (0.0.0.0)`);
});