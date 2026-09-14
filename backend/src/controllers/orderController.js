import { supabaseAdmin } from "../config/supabase.js";

/*
|--------------------------------------------------------------------------
| GET MY ORDERS
|--------------------------------------------------------------------------
*/
export const getMyOrders = async (req, res, next) => {
  try {
    const { data: orders, error } = await supabaseAdmin
      .from("orders")
      .select(`
        id,
        order_number,
        subtotal,
        shipping_fee,
        discount,
        total_amount,
        coupon_id,
        payment_status,
        order_status,
        created_at,
        updated_at,
        order_items (
          id,
          product_id,
          product_name,
          unit_price,
          quantity,
          subtotal
        )
      `)
      .eq("user_id", req.user.id)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Unable to fetch orders",
      });
    }

    return res.status(200).json({
      success: true,
      orders: orders || [],
    });
  } catch (error) {
    next(error);
  }
};


/*
|--------------------------------------------------------------------------
| GET MY ORDER BY ID
|--------------------------------------------------------------------------
*/
export const getMyOrderById = async (req, res, next) => {
  try {
    const { id } = req.validated.params;

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select(`
        *,
        order_items (
          id,
          product_id,
          product_name,
          unit_price,
          quantity,
          subtotal
        )
      `)
      .eq("id", id)
      .eq("user_id", req.user.id)
      .single();

    if (error || !order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};


/*
|--------------------------------------------------------------------------
| CREATE ORDER
|--------------------------------------------------------------------------
*/
export const createOrder = async (req, res, next) => {
  try {
    const {
      address_id,
      coupon_code,
    } = req.body;

    if (!address_id) {
      return res.status(400).json({
        success: false,
        message: "address_id is required",
      });
    }

    const { data, error } = await supabaseAdmin.rpc(
      "create_customer_order",
      {
        p_user_id: req.user.id,
        p_address_id: address_id,
        p_coupon_code:
          coupon_code || null,
      }
    );

    if (error) {
      console.error(
        "Create order RPC error:",
        error
      );

      return res.status(400).json({
        success: false,
        message:
          error.message ||
          "Unable to create order",
      });
    }

    if (!data?.order_id) {
      return res.status(500).json({
        success: false,
        message: "Order creation failed",
      });
    }

    const {
      data: order,
      error: orderError,
    } = await supabaseAdmin
      .from("orders")
      .select(`
        *,
        order_items (
          id,
          product_id,
          product_name,
          unit_price,
          quantity,
          subtotal
        )
      `)
      .eq("id", data.order_id)
      .eq("user_id", req.user.id)
      .single();

    if (orderError || !order) {
      console.error(
        "Order retrieval error:",
        orderError
      );

      return res.status(500).json({
        success: false,
        message:
          "Order was created but could not be retrieved",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    next(error);
  }
};


/*
|--------------------------------------------------------------------------
| CANCEL MY ORDER
|--------------------------------------------------------------------------
*/
export const cancelMyOrder = async (req, res, next) => {
  try {
    const { id } = req.validated.params;

    const { data, error } =
      await supabaseAdmin.rpc(
        "cancel_customer_order",
        {
          p_user_id: req.user.id,
          p_order_id: id,
        }
      );

    if (error) {
      console.error(
        "Cancel order RPC error:",
        error
      );

      return res.status(400).json({
        success: false,
        message:
          error.message ||
          "Unable to cancel order",
      });
    }

    if (!data?.order_id) {
      return res.status(500).json({
        success: false,
        message:
          "Order cancellation failed",
      });
    }

    const {
      data: order,
      error: orderError,
    } = await supabaseAdmin
      .from("orders")
      .select(`
        *,
        order_items (
          id,
          product_id,
          product_name,
          unit_price,
          quantity,
          subtotal
        )
      `)
      .eq("id", id)
      .eq("user_id", req.user.id)
      .single();

    if (orderError || !order) {
      return res.status(500).json({
        success: false,
        message:
          "Order was cancelled but could not be retrieved",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Order cancelled successfully",
      order,
    });
  } catch (error) {
    next(error);
  }
};