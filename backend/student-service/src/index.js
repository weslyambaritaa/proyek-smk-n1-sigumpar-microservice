const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const setupKeycloak = require("./middleware/auth");
const studentRoutes = require("./routes/studentRoutes");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();

app.use(helmet());
// app.use(cors({ origin: "*" }));
app.use(morgan("dev"));
app.use(express.json());

app.get("/health", (req, res) => res.status(200).send("OK"));

const keycloak = setupKeycloak(app);

// PERHATIKAN: Path-nya harus cocok dengan API gateway /api/student
app.use("/api/student", keycloak.protect(), studentRoutes);

app.use((req, res) => res.status(404).json({ message: "Not found" }));
app.use(errorHandler);

const PORT = process.env.PORT || 3008;
app.listen(PORT, () => console.log(`Student service running on port ${PORT}`));
