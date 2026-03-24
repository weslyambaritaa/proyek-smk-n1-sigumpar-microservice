const jwt = require("jsonwebtoken");
const { createError } = require("./errorHandler");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(createError(401, "Token tidak ditemukan"));
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return next(createError(401, "Token tidak valid"));
  }
};

module.exports = authMiddleware;
