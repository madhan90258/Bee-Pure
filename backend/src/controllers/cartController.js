import { supabaseAdmin } from "../config/supabase.js";

export const getCart = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabaseAdmin
      .from("cart_items")
      .select(
        `
        id,
        user_id,
        product_id,
        quantity,
        created_at,
        updated_at,

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
          )
        )
        `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Get cart error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to fetch cart",
      });
    }

    return res.status(200).json({
      success: true,
      cart: data || [],
    });
  } catch (error) {
    next(error);
  }
};

export const addToCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { product_id, quantity } = req.body;

    const requestedQuantity = Number(quantity);

    if (
      !product_id ||
      !Number.isInteger(requestedQuantity) ||
      requestedQuantity < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid product_id and quantity are required",
      });
    }

    const { data: product, error: productError } = await supabaseAdmin
      .from("products")
      .select(
        "id, name, price, stock_quantity, is_active"
      )
      .eq("id", product_id)
      .eq("is_active", true)
      .single();

    if (productError || !product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.stock_quantity < requestedQuantity) {
      return res.status(400).json({
        success: false,
        message: "Requested quantity is not available in stock",
      });
    }

    const { data: existingItem, error: existingError } =
      await supabaseAdmin
        .from("cart_items")
        .select("id, quantity")
        .eq("user_id", userId)
        .eq("product_id", product_id)
        .maybeSingle();

    if (existingError) {
      console.error("Check existing cart item error:", existingError);

      return res.status(500).json({
        success: false,
        message: "Unable to check cart",
      });
    }

    let cartItem;

    if (existingItem) {
      const newQuantity =
        existingItem.quantity + requestedQuantity;

      if (newQuantity > product.stock_quantity) {
        return res.status(400).json({
          success: false,
          message: "Requested quantity exceeds available stock",
        });
      }

      const { data, error } = await supabaseAdmin
        .from("cart_items")
        .update({
          quantity: newQuantity,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingItem.id)
        .eq("user_id", userId)
        .select(
          `
          id,
          user_id,
          product_id,
          quantity,
          created_at,
          updated_at
          `
        )
        .single();

      if (error) {
        console.error("Update cart quantity error:", error);

        return res.status(500).json({
          success: false,
          message: "Unable to update cart",
        });
      }

      cartItem = data;
    } else {
      const { data, error } = await supabaseAdmin
        .from("cart_items")
        .insert({
          user_id: userId,
          product_id,
          quantity: requestedQuantity,
        })
        .select(
          `
          id,
          user_id,
          product_id,
          quantity,
          created_at,
          updated_at
          `
        )
        .single();

      if (error) {
        console.error("Add to cart error:", error);

        return res.status(500).json({
          success: false,
          message: "Unable to add product to cart",
        });
      }

      cartItem = data;
    }

    return res.status(201).json({
      success: true,
      message: "Product added to cart",
      cartItem,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCartItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id: productId } = req.params;
    const { quantity } = req.body;

    const requestedQuantity = Number(quantity);

    if (
      !Number.isInteger(requestedQuantity) ||
      requestedQuantity < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a positive integer",
      });
    }

    const { data: product, error: productError } = await supabaseAdmin
      .from("products")
      .select("id, stock_quantity, is_active")
      .eq("id", productId)
      .eq("is_active", true)
      .single();

    if (productError || !product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (requestedQuantity > product.stock_quantity) {
      return res.status(400).json({
        success: false,
        message: "Requested quantity exceeds available stock",
      });
    }

    const { data, error } = await supabaseAdmin
      .from("cart_items")
      .update({
        quantity: requestedQuantity,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("product_id", productId)
      .select(
        `
        id,
        user_id,
        product_id,
        quantity,
        created_at,
        updated_at
        `
      )
      .maybeSingle();

    if (error) {
      console.error("Update cart item error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to update cart item",
      });
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      cartItem: data,
    });
  } catch (error) {
    next(error);
  }
};

export const removeFromCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id: productId } = req.params;

    const { data, error } = await supabaseAdmin
      .from("cart_items")
      .delete()
      .eq("user_id", userId)
      .eq("product_id", productId)
      .select("id, product_id");

    if (error) {
      console.error("Remove cart item error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to remove cart item",
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product removed from cart",
    });
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const { error } = await supabaseAdmin
      .from("cart_items")
      .delete()
      .eq("user_id", userId);

    if (error) {
      console.error("Clear cart error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to clear cart",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
    });
  } catch (error) {
    next(error);
  }
};