import { supabaseAdmin } from "../config/supabase.js";

export const getCurrentUser = async (req, res, next) => {
  try {
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

    return res.status(200).json({
      success: true,
      user: {
        id: req.user.id,
        email: req.user.email,
      },
      profile,
    });
  } catch (error) {
    next(error);
  }
};