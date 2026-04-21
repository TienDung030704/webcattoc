function checkRoles(...roles) {
  return (req, res, next) => {
    const role = req.auth?.user?.role;

    if (!role || !roles.includes(role)) {
      return res.error("Forbidden", 403);
    }

    next();
  };
}

module.exports = checkRoles;
