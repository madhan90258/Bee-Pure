import { supabaseAdmin } from "../config/supabase.js";

export const getFavorites = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabaseAdmin
      .from("favorites")
      .select(
        `
        user_id,
        product_id,
        created_at,

        products (
          id,
          name,
          slug,
          description,
          price,
          old_price,
          stock_quantity,
          rating,
          is_active,

          product_images (
            id,
            storage_path,
            alt_text,
            is_primary
          ),

          categories (
            id,
            name,
            slug
          ),

          farmers (
            id,
            name,
            location
          )
        )
        `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Get favorites error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to fetch favorites",
      });
    }

    return res.status(200).json({
      success: true,
      favorites: data || [],
    });
  } catch (error) {
    next(error);
  }
};

export const addToFavorites = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { product_id } = req.body;

    if (!product_id) {
      return res.status(400).json({
        success: false,
        message: "product_id is required",
      });
    }

    const { data: product, error: productError } = await supabaseAdmin
      .from("products")
      .select("id, name, is_active")
      .eq("id", product_id)
      .eq("is_active", true)
      .single();

    if (productError || !product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const { data: existingFavorite, error: existingError } =
      await supabaseAdmin
        .from("favorites")
        .select("user_id, product_id")
        .eq("user_id", userId)
        .eq("product_id", product_id)
        .maybeSingle();

    if (existingError) {
      console.error("Check favorite error:", existingError);

      return res.status(500).json({
        success: false,
        message: "Unable to check favorites",
      });
    }

    if (existingFavorite) {
      return res.status(200).json({
        success: true,
        message: "Product is already in favorites",
        favorite: existingFavorite,
      });
    }

    const { data, error } = await supabaseAdmin
      .from("favorites")
      .insert({
        user_id: userId,
        product_id,
      })
      .select(
        `
        user_id,
        product_id,
        created_at
        `
      )
      .single();

    if (error) {
      console.error("Add favorite error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to add product to favorites",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Product added to favorites",
      favorite: data,
    });
  } catch (error) {
    next(error);
  }
};

export const removeFromFavorites = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id: productId } = req.params;

    const { data, error } = await supabaseAdmin
      .from("favorites")
      .delete()
      .eq("user_id", userId)
      .eq("product_id", productId)
      .select("user_id, product_id");

    if (error) {
      console.error("Remove favorite error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to remove favorite",
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Favorite not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product removed from favorites",
    });
  } catch (error) {
    next(error);
  }
};

export const clearFavorites = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const { error } = await supabaseAdmin
      .from("favorites")
      .delete()
      .eq("user_id", userId);

    if (error) {
      console.error("Clear favorites error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to clear favorites",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Favorites cleared successfully",
    });
  } catch (error) {
    next(error);
  }
};