import { supabaseAdmin } from "../config/supabase.js";

/*
|--------------------------------------------------------------------------
| Get All Farmers
|--------------------------------------------------------------------------
*/

export const getFarmers = async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("farmers")
      .select(`
        id,
        name,
        location,
        description,
        image_path,
        is_active,
        created_at,
        updated_at
      `)
      .eq("is_active", true)
      .order("name", {
        ascending: true,
      });

    if (error) {
      console.error("Get farmers error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to fetch farmers",
      });
    }

    return res.status(200).json({
      success: true,
      farmers: data || [],
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Get Farmer By ID
|--------------------------------------------------------------------------
*/

export const getFarmerById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from("farmers")
      .select(`
        id,
        name,
        location,
        description,
        image_path,
        is_active,
        created_at,
        updated_at
      `)
      .eq("id", id)
      .eq("is_active", true)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        message: "Farmer not found",
      });
    }

    return res.status(200).json({
      success: true,
      farmer: data,
    });
  } catch (error) {
    next(error);
  }
};