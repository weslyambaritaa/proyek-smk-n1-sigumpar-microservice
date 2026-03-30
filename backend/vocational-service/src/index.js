const express = require("express");
// const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { errorHandler } = require("./middleware/errorHandler");

const vocationalRoutes = require("./routes/vocationalRoutes"); 

const app = express();
const PORT = process.env.PORT || 3007;

// 1. PINDAHKAN CORS KE SINI (Harus di atas sebelum rute!)
// app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "vocational-service", 
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/vocational", vocationalRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route '${req.originalUrl}' tidak ditemukan di Vocational Service`,
  });
});

app.use(errorHandler);

// 2. TAMBAHKAN '0.0.0.0' AGAR BISA DIAKSES OLEH NGINX
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Vocational Service berjalan di port ${PORT}`);
});