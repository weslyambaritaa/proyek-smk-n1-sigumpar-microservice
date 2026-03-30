// Middleware untuk membatasi akses berdasarkan role dari token Keycloak.
// Roles: guru-mapel | kepala-sekolah | waka-sekolah

const roleGuard = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized: User tidak teridentifikasi" });
      }

      // Keycloak menyimpan roles di realm_access.roles
      const userRoles =
        (req.user.realm_access && req.user.realm_access.roles) || [];

      const hasRole = allowedRoles.some((role) => userRoles.includes(role));

      if (!hasRole) {
        return res.status(403).json({
          message: `Forbidden: Hanya role [${allowedRoles.join(", ")}] yang diizinkan`,
        });
      }

      next();
    } catch (err) {
      console.error("Role Guard Error:", err);
      return res.status(500).json({ message: "Internal Server Error in Role Guard" });
    }
  };
};

module.exports = roleGuard;