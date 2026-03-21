const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const setupKeycloak = require("./middleware/auth");
const userRoutes = require("./routes/userRoutes");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();

app.use(helmet());
app.use(cors({ origin: "*" }));
app.use(morgan("dev"));
app.use(express.json());

app.get("/health", (req, res) => res.status(200).send("OK"));

const keycloak = setupKeycloak(app);
app.use("/api/users", keycloak.protect(), userRoutes);

app.use((req, res) => res.status(404).json({ message: "Not found" }));
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Users service running on port ${PORT}`));