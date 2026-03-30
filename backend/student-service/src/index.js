const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const { errorHandler } = require("./middleware/errorHandler");

const studentRoutes = require("./routes/studentRoutes");
const gradeRoutes = require("./routes/gradeRoutes");
const app = express();

app.use(helmet());
// CORS ditangani oleh Nginx API Gateway — jangan aktifkan di sini
// app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(morgan("dev"));
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Student service is running",
  });
});

app.use("/api/students", studentRoutes);
app.use("/api/grades", gradeRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3008;
app.listen(PORT, () => console.log(`Student service running on port ${PORT}`));