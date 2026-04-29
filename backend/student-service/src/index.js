const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const studentRoutes = require("./routes/studentRoutes");

const app = express();
const PORT = process.env.PORT || 3008;

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan("dev"));
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "student-service",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/student", studentRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route '${req.originalUrl}' tidak ditemukan`,
  });
});

app.use((err, req, res, next) => {
  console.error("Student service error:", err);
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Student Service running on port ${PORT}`);
});
