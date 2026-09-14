import { supabaseAdmin } from "../config/supabase.js";


/*
|--------------------------------------------------------------------------
| GET SELLER PRODUCTS
|--------------------------------------------------------------------------
*/
export const getSellerProducts = async (
  req,
  res,
  next
) => {
  try {
    const {
      data: products,
      error,
    } = await supabaseAdmin
      .from("products")
      .select(`
        *,
        categories (
          id,
          name,
          slug
        ),
        farmers (
          id,
          name,
          location
        ),
        product_images (
          id,
          storage_path,
          is_primary
        )
      `)
      .eq(
        "seller_id",
        req.profile.id
      )
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      return res.status(500).json({
        success: false,
        message:
          "Unable to fetch seller products",
      });
    }

    return res.status(200).json({
      success: true,
      products:
        products || [],
    });
  } catch (error) {
    next(error);
  }
};


/*
|--------------------------------------------------------------------------
| GET SELLER PRODUCT
|--------------------------------------------------------------------------
*/
export const getSellerProductById = async (
  req,
  res,
  next
) => {
  try {
    const { id } =
      req.validated.params;

    const {
      data: product,
      error,
    } = await supabaseAdmin
      .from("products")
      .select(`
        *,
        categories (
          id,
          name,
          slug
        ),
        farmers (
          id,
          name,
          location
        ),
        product_images (
          id,
          storage_path,
          is_primary
        )
      `)
      .eq("id", id)
      .eq(
        "seller_id",
        req.profile.id
      )
      .single();

    if (error || !product) {
      return res.status(404).json({
        success: false,
        message:
          "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};


/*
|--------------------------------------------------------------------------
| CREATE SELLER PRODUCT
|--------------------------------------------------------------------------
*/
export const createSellerProduct = async (
  req,
  res,
  next
) => {
  try {
    const {
      category_id,
      farmer_id,
      name,
      slug,
      description = null,
      price,
      old_price = null,
      stock_quantity = 0,
      rating = 0,
      is_active = true,
    } = req.body;

    if (
      !category_id ||
      !farmer_id ||
      !name?.trim() ||
      !slug?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "category_id, farmer_id, name and slug are required",
      });
    }

    const numericPrice =
      Number(price);

    if (
      !Number.isFinite(
        numericPrice
      ) ||
      numericPrice <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Price must be greater than 0",
      });
    }

    const numericStock =
      Number(stock_quantity);

    if (
      !Number.isInteger(
        numericStock
      ) ||
      numericStock < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Stock quantity must be a non-negative integer",
      });
    }

    let numericOldPrice =
      null;

    if (
      old_price !== null &&
      old_price !== undefined &&
      old_price !== ""
    ) {
      numericOldPrice =
        Number(old_price);

      if (
        !Number.isFinite(
          numericOldPrice
        ) ||
        numericOldPrice < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid old price",
        });
      }
    }

    const numericRating =
      Number(rating);

    if (
      !Number.isFinite(
        numericRating
      ) ||
      numericRating < 0 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Rating must be between 0 and 5",
      });
    }

    const {
      data: product,
      error,
    } = await supabaseAdmin
      .from("products")
      .insert({
        category_id,
        farmer_id,
        seller_id:
          req.profile.id,
        name: name.trim(),
        slug: slug.trim(),
        description,
        price:
          numericPrice,
        old_price:
          numericOldPrice,
        stock_quantity:
          numericStock,
        rating:
          numericRating,
        is_active:
          Boolean(is_active),
      })
      .select("*")
      .single();

    if (error) {
      if (
        error.code === "23505"
      ) {
        return res.status(409).json({
          success: false,
          message:
            "Product slug already exists",
        });
      }

      return res.status(400).json({
        success: false,
        message:
          error.message ||
          "Unable to create product",
      });
    }

    return res.status(201).json({
      success: true,
      message:
        "Product created successfully",
      product,
    });
  } catch (error) {
    next(error);
  }
};


/*
|--------------------------------------------------------------------------
| UPDATE SELLER PRODUCT
|--------------------------------------------------------------------------
*/
export const updateSellerProduct = async (
  req,
  res,
  next
) => {
  try {
    const { id } =
      req.validated.params;

    const {
      category_id,
      farmer_id,
      name,
      slug,
      description,
      price,
      old_price,
      stock_quantity,
      rating,
      is_active,
    } = req.body;

    const updates = {};

    if (
      category_id !==
      undefined
    ) {
      updates.category_id =
        category_id;
    }

    if (
      farmer_id !==
      undefined
    ) {
      updates.farmer_id =
        farmer_id;
    }

    if (
      name !== undefined
    ) {
      if (!name.trim()) {
        return res.status(400).json({
          success: false,
          message:
            "Product name cannot be empty",
        });
      }

      updates.name =
        name.trim();
    }

    if (
      slug !== undefined
    ) {
      if (!slug.trim()) {
        return res.status(400).json({
          success: false,
          message:
            "Product slug cannot be empty",
        });
      }

      updates.slug =
        slug.trim();
    }

    if (
      description !==
      undefined
    ) {
      updates.description =
        description;
    }

    if (
      price !== undefined
    ) {
      const value =
        Number(price);

      if (
        !Number.isFinite(value) ||
        value <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Price must be greater than 0",
        });
      }

      updates.price =
        value;
    }

    if (
      old_price !==
      undefined
    ) {
      if (
        old_price === null ||
        old_price === ""
      ) {
        updates.old_price =
          null;
      } else {
        const value =
          Number(old_price);

        if (
          !Number.isFinite(
            value
          ) ||
          value < 0
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid old price",
          });
        }

        updates.old_price =
          value;
      }
    }

    if (
      stock_quantity !==
      undefined
    ) {
      const value =
        Number(stock_quantity);

      if (
        !Number.isInteger(
          value
        ) ||
        value < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Stock quantity must be a non-negative integer",
        });
      }

      updates.stock_quantity =
        value;
    }

    if (
      rating !== undefined
    ) {
      const value =
        Number(rating);

      if (
        !Number.isFinite(value) ||
        value < 0 ||
        value > 5
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Rating must be between 0 and 5",
        });
      }

      updates.rating =
        value;
    }

    if (
      is_active !==
      undefined
    ) {
      updates.is_active =
        Boolean(is_active);
    }

    updates.updated_at =
      new Date().toISOString();

    const {
      data: product,
      error,
    } = await supabaseAdmin
      .from("products")
      .update(updates)
      .eq("id", id)
      .eq(
        "seller_id",
        req.profile.id
      )
      .select("*")
      .single();

    if (error || !product) {
      if (
        error?.code ===
        "23505"
      ) {
        return res.status(409).json({
          success: false,
          message:
            "Product slug already exists",
        });
      }

      return res.status(404).json({
        success: false,
        message:
          "Product not found or update failed",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Product updated successfully",
      product,
    });
  } catch (error) {
    next(error);
  }
};


/*
|--------------------------------------------------------------------------
| DELETE / DEACTIVATE SELLER PRODUCT
|--------------------------------------------------------------------------
*/
export const deleteSellerProduct = async (
  req,
  res,
  next
) => {
  try {
    const { id } =
      req.validated.params;

    const {
      data: product,
      error,
    } = await supabaseAdmin
      .from("products")
      .update({
        is_active: false,
        updated_at:
          new Date().toISOString(),
      })
      .eq("id", id)
      .eq(
        "seller_id",
        req.profile.id
      )
      .select("*")
      .single();

    if (error || !product) {
      return res.status(404).json({
        success: false,
        message:
          "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Product deactivated successfully",
      product,
    });
  } catch (error) {
    next(error);
  }
};