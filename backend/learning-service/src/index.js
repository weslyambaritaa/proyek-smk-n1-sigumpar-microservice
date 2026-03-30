const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { errorHandler } = require("./middleware/errorHandler");
const learningRoutes = require("./routes/learningRoutes");

const app = express();
const PORT = process.env.PORT || 3006;

app.use(helmet());
app.use(cors({ origin: "*" }));
app.use(morgan("dev"));
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "OK", service: "learning-service", timestamp: new Date().toISOString() });
});

app.use("/api/learning", learningRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route '${req.originalUrl}' tidak ditemukan` });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Learning Service running on port ${PORT}`);
});