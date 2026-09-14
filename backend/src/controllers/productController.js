import { supabaseAdmin } from "../config/supabase.js";

/*
|--------------------------------------------------------------------------
| Get All Products
|--------------------------------------------------------------------------
*/

export const getProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = "",
      category = "",
      farmer = "",
      sort = "newest",
    } = req.query;

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);

    const limitNumber = Math.min(
      Math.max(parseInt(limit, 10) || 20, 1),
      100
    );

    const from = (pageNumber - 1) * limitNumber;
    const to = from + limitNumber - 1;

    let query = supabaseAdmin
      .from("products")
      .select(
        `
        id,
        name,
        slug,
        description,
        price,
        old_price,
        stock_quantity,
        rating,
        is_active,
        created_at,
        updated_at,
        category_id,
        farmer_id,
        seller_id,

        product_images (
          id,
          storage_path,
          alt_text,
          is_primary,
          created_at
        ),

        categories (
          id,
          name,
          slug
        ),

        farmers (
          id,
          name,
          location,
          description,
          image_path
        )
        `,
        { count: "exact" }
      )
      .eq("is_active", true);

    /*
    |--------------------------------------------------------------------------
    | Search
    |--------------------------------------------------------------------------
    */

    if (search.trim()) {
      query = query.or(
        `name.ilike.%${search.trim()}%,description.ilike.%${search.trim()}%`
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Category Filter
    |--------------------------------------------------------------------------
    */

    if (category.trim()) {
      query = query.eq("category_id", category.trim());
    }

    /*
    |--------------------------------------------------------------------------
    | Farmer Filter
    |--------------------------------------------------------------------------
    */

    if (farmer.trim()) {
      query = query.eq("farmer_id", farmer.trim());
    }

    /*
    |--------------------------------------------------------------------------
    | Sorting
    |--------------------------------------------------------------------------
    */

    switch (sort) {
      case "price_low":
        query = query.order("price", {
          ascending: true,
        });
        break;

      case "price_high":
        query = query.order("price", {
          ascending: false,
        });
        break;

      case "rating":
        query = query.order("rating", {
          ascending: false,
        });
        break;

      case "name":
        query = query.order("name", {
          ascending: true,
        });
        break;

      case "newest":
      default:
        query = query.order("created_at", {
          ascending: false,
        });
        break;
    }

    /*
    |--------------------------------------------------------------------------
    | Pagination
    |--------------------------------------------------------------------------
    */

    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error("Get products error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to fetch products",
        error: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
    }

    const totalProducts = count || 0;

    return res.status(200).json({
      success: true,
      products: data || [],
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total: totalProducts,
        totalPages: Math.ceil(
          totalProducts / limitNumber
        ),
      },
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Get Product By ID
|--------------------------------------------------------------------------
*/

export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from("products")
      .select(
        `
        id,
        name,
        slug,
        description,
        price,
        old_price,
        stock_quantity,
        rating,
        is_active,
        created_at,
        updated_at,
        category_id,
        farmer_id,
        seller_id,

        product_images (
          id,
          storage_path,
          alt_text,
          is_primary,
          created_at
        ),

        categories (
          id,
          name,
          slug
        ),

        farmers (
          id,
          name,
          location,
          description,
          image_path
        )
        `
      )
      .eq("id", id)
      .eq("is_active", true)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product: data,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Get Product By Slug
|--------------------------------------------------------------------------
*/

export const getProductBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const { data, error } = await supabaseAdmin
      .from("products")
      .select(
        `
        id,
        name,
        slug,
        description,
        price,
        old_price,
        stock_quantity,
        rating,
        is_active,
        created_at,
        updated_at,
        category_id,
        farmer_id,
        seller_id,

        product_images (
          id,
          storage_path,
          alt_text,
          is_primary,
          created_at
        ),

        categories (
          id,
          name,
          slug
        ),

        farmers (
          id,
          name,
          location,
          description,
          image_path
        )
        `
      )
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product: data,
    });
  } catch (error) {
    next(error);
  }
};