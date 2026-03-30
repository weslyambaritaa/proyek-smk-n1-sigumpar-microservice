const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const learningRoutes = require("./routes/learningRoutes");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 3006;

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// Static files untuk dokumen yang diupload
app.use(
  "/api/learning/uploads",
  express.static(path.join(__dirname, "../uploads"))
);

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "learning-service",
    timestamp: new Date().toISOString(),
  });
});

// Mount routes
app.use("/api/learning", learningRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route '${req.originalUrl}' tidak ditemukan`,
  });
});

// Error handler (selalu di akhir)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Learning Service running on port ${PORT}`);
});