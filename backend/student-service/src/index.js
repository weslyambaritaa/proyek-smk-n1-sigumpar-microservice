const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 3008;

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan("dev"));
app.use(express.json());

// Health check
app.get("/health", (req, res) =>
  res.json({ status: "OK", service: "student-service", timestamp: new Date().toISOString() })
);

// Placeholder routes - student data dikelola oleh academic-service
app.use("/api/students", (req, res) => {
  res.json({ success: true, message: "Student service aktif - data dikelola oleh academic-service" });
});

app.use((req, res) =>
  res.status(404).json({ success: false, message: `Route '${req.originalUrl}' tidak ditemukan` })
);

app.use(errorHandler);

app.listen(PORT, "0.0.0.0", () =>
  console.log(`Student Service running on port ${PORT}`)
);
