const { createError } = require("./errorHandler");

const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(createError(401, "Unauthorized"));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(
        createError(403, "Akses ditolak. Role Anda tidak diizinkan."),
      );
    }
    next();
  };
};

module.exports = roleMiddleware;
