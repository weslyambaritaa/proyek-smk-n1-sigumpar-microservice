require("dotenv").config();

const express = require("express");
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    service: "student-service",
    status: "aktif",
    port: process.env.PORT || 3008
  });
});

// route utama
app.use("/api/students", require("./routes/siswaRoutes"));
app.use("/api/classes", require("./routes/kelasRoutes"));

// handler 404
app.use((req, res) => {
  res.status(404).json({
    message: `Route '${req.originalUrl}' not found`
  });
});

app.listen(process.env.PORT || 3008, () => {
  console.log(`Student Service running on port ${process.env.PORT || 3008}`);
});