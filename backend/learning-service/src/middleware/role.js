// Mendapatkan roles dari token (sesuai struktur Keycloak)
const getUserRoles = (req) => {
  // Coba dari realm roles
  if (req.user.realm_access && req.user.realm_access.roles) {
    return req.user.realm_access.roles;
  }
  // Jika menggunakan client roles (misal untuk client 'backend-client')
  if (req.user.resource_access && req.user.resource_access["backend-client"]) {
    return req.user.resource_access["backend-client"].roles || [];
  }
  return [];
};

// Middleware untuk mengecek role (umum)
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    const roles = getUserRoles(req);
    const hasRole = allowedRoles.some((role) => roles.includes(role));
    if (!hasRole) {
      return res
        .status(403)
        .json({ message: "Akses ditolak, role tidak mencukupi" });
    }
    next();
  };
};

// Middleware khusus: hanya guru
const isGuru = (req, res, next) => {
  const roles = getUserRoles(req);
  if (!roles.includes("guru")) {
    return res
      .status(403)
      .json({ message: "Hanya guru yang dapat melakukan absensi" });
  }
  next();
};

// Middleware: wakepsek atau kepsek
const isWakepsekOrKepsek = (req, res, next) => {
  const roles = getUserRoles(req);
  if (!roles.includes("wakepsek") && !roles.includes("kepsek")) {
    return res
      .status(403)
      .json({ message: "Akses hanya untuk wakepsek/kepsek" });
  }
  next();
};

module.exports = { getUserRoles, checkRole, isGuru, isWakepsekOrKepsek };
