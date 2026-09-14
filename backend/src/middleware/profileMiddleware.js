import { supabaseAdmin } from "../config/supabase.js";

export const loadUserProfile = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .select("id, email, full_name, phone, role")
      .eq("id", req.user.id)
      .single();

    if (error || !profile) {
      return res.status(404).json({
        success: false,
        message: "User profile not found",
      });
    }

    req.profile = profile;

    next();
  } catch (error) {
    next(error);
  }
};

export const requireProfileRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.profile) {
      return res.status(401).json({
        success: false,
        message: "User profile not loaded",
      });
    }

    if (!allowedRoles.includes(req.profile.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to access this resource",
      });
    }

    next();
  };
};

export const requireCustomerProfile = requireProfileRole("customer");

export const requireSellerProfile = requireProfileRole("seller");

export const requireAdminProfile = requireProfileRole("admin");

export const requireSellerOrAdminProfile =
  requireProfileRole("seller", "admin");