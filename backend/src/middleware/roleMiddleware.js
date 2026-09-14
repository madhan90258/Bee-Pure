export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const userRole = req.user.user_metadata?.role;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to access this resource",
      });
    }

    next();
  };
};

export const requireCustomer = requireRole("customer");

export const requireSeller = requireRole("seller");

export const requireAdmin = requireRole("admin");

export const requireSellerOrAdmin = requireRole("seller", "admin");