import { supabaseAdmin } from "../config/supabase.js";

/*
|--------------------------------------------------------------------------
| Get All Categories
|--------------------------------------------------------------------------
*/

export const getCategories = async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("categories")
      .select(
        `
        id,
        name,
        slug,
        description,
        image_path,
        is_active,
        created_at,
        updated_at
        `
      )
      .eq("is_active", true)
      .order("name", {
        ascending: true,
      });

    if (error) {
      console.error("Get categories error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to fetch categories",
      });
    }

    return res.status(200).json({
      success: true,
      categories: data || [],
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Get Category By ID
|--------------------------------------------------------------------------
*/

export const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from("categories")
      .select(
        `
        id,
        name,
        slug,
        description,
        image_path,
        is_active,
        created_at,
        updated_at
        `
      )
      .eq("id", id)
      .eq("is_active", true)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      category: data,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Get Category By Slug
|--------------------------------------------------------------------------
*/

export const getCategoryBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const { data, error } = await supabaseAdmin
      .from("categories")
      .select(
        `
        id,
        name,
        slug,
        description,
        image_path,
        is_active,
        created_at,
        updated_at
        `
      )
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      category: data,
    });
  } catch (error) {
    next(error);
  }
};