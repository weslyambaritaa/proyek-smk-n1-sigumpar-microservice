const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const studentRoutes = require('./routes/studentRoutes');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3008;

// ─── Global Middleware ──────────────────────────────────────────────────────
app.use(helmet());
// app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(morgan('dev'));
app.use(express.json());

// ─── Health Check ───────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'student-service',
    timestamp: new Date().toISOString(),
  });
});

// ─── Routes ─────────────────────────────────────────────────────────────────
// Semua route wali kelas dimount di /api/students
app.use('/api/students', studentRoutes);

// ─── 404 Handler ────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route '${req.originalUrl}' tidak ditemukan`,
  });
});

// ─── Global Error Handler (harus paling akhir) ──────────────────────────────
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Student Service (Wali Kelas) berjalan di port ${PORT}`);
});