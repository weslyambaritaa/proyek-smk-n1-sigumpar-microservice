const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const setupKeycloak = require("./middleware/auth");
const { errorHandler } = require("./middleware/errorHandler");

// PERHATIKAN: Di student-service kita tidak boleh pakai userRoutes!
// Jika Anda belum membuat studentRoutes, kita buat sementara seperti ini agar tidak error:
const studentRoutes = express.Router();
studentRoutes.get("/", (req, res) => res.json({ message: "Ini data students" }));

const app = express();

app.use(helmet());
// app.use(cors({ origin: "*" }));
app.use(morgan("dev"));
app.use(express.json());

app.get("/health", (req, res) => res.status(200).send("OK"));

const keycloak = setupKeycloak(app);

// PERHATIKAN: Path-nya adalah /api/students
app.use("/api/students", keycloak.protect(), studentRoutes);

app.use((req, res) => res.status(404).json({ message: "Not found" }));
app.use(errorHandler);

const PORT = process.env.PORT || 3008;
app.listen(PORT, () => console.log(`Student service running on port ${PORT}`));