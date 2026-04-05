const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { errorHandler } = require("./middleware/errorHandler");
const studentRoutes = require("./routes/studentRoutes");

const app = express();
const PORT = process.env.PORT || 3008;

// Middleware global
app.use(helmet());
//app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "student-service",
    timestamp: new Date().toISOString(),
  });
});

// Mount routes
app.use("/api/student", studentRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route '${req.originalUrl}' tidak ditemukan`,
  });
});

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Student Service running on port ${PORT}`);
});
