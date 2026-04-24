const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const { errorHandler } = require("./middleware/errorHandler");
const studentRoutes = require("./routes/studentRoutes");
const extractIdentity = require("./middleware/extractIdentity");

const app = express();
const PORT = process.env.PORT || 3008;

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan("dev"));
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use(
  "/api/student/uploads",
  express.static(path.join(__dirname, "../uploads")),
);

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "student-service",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/student", extractIdentity, studentRoutes);

app.use((req, res) => {
  res
    .status(404)
    .json({
      success: false,
      message: `Route '${req.originalUrl}' tidak ditemukan`,
    });
});

app.use(errorHandler);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Student Service running on port ${PORT}`);
});
