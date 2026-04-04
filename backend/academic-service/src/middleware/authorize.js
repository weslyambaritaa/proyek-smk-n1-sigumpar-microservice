// src/middleware/authorize.js
const authorize = (allowedRoles) => {
  return (req, res, next) => {
    try {
      // Ambil roles dari req.user yang sudah di-set oleh extractIdentity
      const roles = req.user?.realm_access?.roles || [];

      // Cek apakah user memiliki setidaknya satu role yang diizinkan
      const hasRole = allowedRoles.some((role) => roles.includes(role));

      if (!hasRole) {
        return res.status(403).json({
          error: "Forbidden",
          message: "Anda tidak memiliki akses ke resource ini",
          required_roles: allowedRoles,
          user_roles: roles,
        });
      }

      next();
    } catch (err) {
      console.error("Authorization error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
};

module.exports = authorize;
