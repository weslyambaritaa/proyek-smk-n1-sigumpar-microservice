const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");

const studentRoutes = require("./routes/studentRoutes");
const gradeRoutes = require("./routes/gradeRoutes");
const parentingRoutes = require("./routes/parentingRoutes");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();

app.use(helmet());
app.use(cors({ origin: "*" }));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Student service is running",
  });
});

app.use("/api/students", studentRoutes);
app.use("/api/grades", gradeRoutes);
app.use("/api/parenting", parentingRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route tidak ditemukan",
  });
});

app.use(errorHandler);

const PORT = process.env.PORT || 3008;
app.listen(PORT, () => {
  console.log(`Student service running on port ${PORT}`);
});