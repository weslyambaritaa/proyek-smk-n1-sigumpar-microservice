const express = require("express");
const helmet  = require("helmet");
const morgan  = require("morgan");
const { errorHandler } = require("./middleware/errorHandler");

const app  = express();
const PORT = process.env.PORT || 3007;

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", service: "vocational-service", timestamp: new Date().toISOString() });
});

// Mount routes
app.use("/api/pkl", require("./routes/pklRoutes"));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route '${req.originalUrl}' tidak ditemukan` });
});

// Error handler — selalu paling akhir
app.use(errorHandler);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Vocational Service berjalan di http://localhost:${PORT}`);
});
