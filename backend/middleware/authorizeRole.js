const authorizeRole = (roles) => {
    return (req, res, next) => {
      if (!req.user.user_id || !roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      next();
    };
  };
  
module.exports = authorizeRole;