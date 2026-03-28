const express = require("express");
const vocationalRoutes = require("./routes/vocationalRoutes");
const { errorHandler } = require("./middleware/errorHandler");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3004;

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Mount routes
app.use("/api/vocational", vocationalRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Vocational Service running on port ${PORT}`);
});
