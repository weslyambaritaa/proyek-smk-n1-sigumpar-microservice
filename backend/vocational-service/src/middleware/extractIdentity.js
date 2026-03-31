// file: src/middleware/extractIdentity.js
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Pastikan token ada (Walaupun Nginx sudah memfilter ini)
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized: Token missing" });
    }

    const token = authHeader.split(" ")[1];

    // Decode isi token Keycloak secara instan (TANPA verifikasi ulang karena Nginx sudah melakukannya)
    const decoded = jwt.decode(token);

    if (!decoded) {
      return res.status(401).json({ message: "Invalid Token Payload" });
    }

    // Kembalikan objek user seutuhnya seperti semula!
    req.user = decoded;

    next();
  } catch (err) {
    console.error("Extract Identity Error:", err);
    return res
      .status(500)
      .json({ message: "Internal Server Error in Identity Extraction" });
  }
};
