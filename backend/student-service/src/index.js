const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

<<<<<<< Updated upstream
const studentRoutes = require("./routes/studentRoutes");
const gradeRoutes = require("./routes/gradeRoutes");
const { errorHandler } = require("./middleware/errorHandler");

=======
const { errorHandler } = require("./middleware/errorHandler");

// PERHATIKAN: Di student-service kita tidak boleh pakai userRoutes!
// Jika Anda belum membuat studentRoutes, kita buat sementara seperti ini agar tidak error:
const studentRoutes = express.Router();
studentRoutes.get("/", (req, res) =>
  res.json({ message: "Ini data students" }),
);

const gradeRoutes = require("./routes/gradeRoutes");
>>>>>>> Stashed changes
const app = express();

app.use(helmet());
app.use(cors({ origin: "*" }));
app.use(morgan("dev"));
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Student service is running",
  });
});

<<<<<<< Updated upstream
app.use("/api/students", studentRoutes);
app.use("/api/grades", gradeRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route tidak ditemukan",
  });
});
=======
// Tanpa auth middleware
app.use("/api/students", studentRoutes);
app.use("/api/grades", gradeRoutes);
>>>>>>> Stashed changes

app.use(errorHandler);

const PORT = process.env.PORT || 3008;
<<<<<<< Updated upstream
app.listen(PORT, () => {
  console.log(`Student service running on port ${PORT}`);
});
=======
app.listen(PORT, () => console.log(`Student service running on port ${PORT}`));
>>>>>>> Stashed changes
