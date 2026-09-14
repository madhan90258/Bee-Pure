import { supabaseAdmin } from "../config/supabase.js";


/*
|--------------------------------------------------------------------------
| GET PROFILE
|--------------------------------------------------------------------------
*/
export const getProfile = async (
  req,
  res,
  next
) => {
  try {
    const {
      data: profile,
      error,
    } = await supabaseAdmin
      .from("profiles")
      .select(`
        id,
        email,
        full_name,
        phone,
        role,
        created_at,
        updated_at
      `)
      .eq("id", req.user.id)
      .single();

    if (error || !profile) {
      return res.status(404).json({
        success: false,
        message:
          "Profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    next(error);
  }
};


/*
|--------------------------------------------------------------------------
| UPDATE PROFILE
|--------------------------------------------------------------------------
*/
export const updateProfile = async (
  req,
  res,
  next
) => {
  try {
    const {
      full_name,
      phone,
    } = req.body;

    const updates = {};

    if (
      full_name !== undefined
    ) {
      if (
        typeof full_name !==
          "string" ||
        !full_name.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Full name cannot be empty",
        });
      }

      updates.full_name =
        full_name.trim();
    }

    if (
      phone !== undefined
    ) {
      if (
        phone !== null &&
        typeof phone !==
          "string"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid phone number",
        });
      }

      updates.phone =
        phone?.trim() || null;
    }

    if (
      Object.keys(updates)
        .length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "No profile changes provided",
      });
    }

    updates.updated_at =
      new Date().toISOString();

    const {
      data: profile,
      error,
    } = await supabaseAdmin
      .from("profiles")
      .update(updates)
      .eq("id", req.user.id)
      .select(`
        id,
        email,
        full_name,
        phone,
        role,
        created_at,
        updated_at
      `)
      .single();

    if (error || !profile) {
      return res.status(400).json({
        success: false,
        message:
          error?.message ||
          "Unable to update profile",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Profile updated successfully",
      profile,
    });
  } catch (error) {
    next(error);
  }
};