const roleGuard = (...allowedRoles) => {
  return (req, res, next) => {
    const roles = req.user?.realm_access?.roles || [];
    const hasRole = allowedRoles.some((role) => roles.includes(role));
    if (!hasRole) {
      return res.status(403).json({ success: false, message: "Akses ditolak" });
    }
    next();
  };
};
module.exports = roleGuard;