import { supabaseAdmin } from "../config/supabase.js";


/*
|--------------------------------------------------------------------------
| GET SELLER ORDERS
|--------------------------------------------------------------------------
*/
export const getSellerOrders = async (
  req,
  res,
  next
) => {
  try {
    const sellerId =
      req.profile.id;

    /*
    |--------------------------------------------------------------------------
    | Find seller products
    |--------------------------------------------------------------------------
    */

    const {
      data: products,
      error: productsError,
    } = await supabaseAdmin
      .from("products")
      .select("id")
      .eq(
        "seller_id",
        sellerId
      );

    if (productsError) {
      return res.status(500).json({
        success: false,
        message:
          "Unable to fetch seller products",
      });
    }

    const productIds =
      (products || []).map(
        (product) => product.id
      );

    if (productIds.length === 0) {
      return res.status(200).json({
        success: true,
        orders: [],
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Find order items
    |--------------------------------------------------------------------------
    */

    const {
      data: orderItems,
      error: itemsError,
    } = await supabaseAdmin
      .from("order_items")
      .select(`
        id,
        order_id,
        product_id,
        product_name,
        unit_price,
        quantity,
        subtotal
      `)
      .in(
        "product_id",
        productIds
      )
      .order("created_at", {
        ascending: false,
      });

    if (itemsError) {
      return res.status(500).json({
        success: false,
        message:
          "Unable to fetch seller order items",
      });
    }

    const orderIds = [
      ...new Set(
        (orderItems || []).map(
          (item) =>
            item.order_id
        )
      ),
    ];

    if (orderIds.length === 0) {
      return res.status(200).json({
        success: true,
        orders: [],
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Fetch orders
    |--------------------------------------------------------------------------
    */

    const {
      data: orders,
      error: ordersError,
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
      .in(
        "id",
        orderIds
      )
      .order("created_at", {
        ascending: false,
      });

    if (ordersError) {
      return res.status(500).json({
        success: false,
        message:
          "Unable to fetch seller orders",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Return only seller's order items
    |--------------------------------------------------------------------------
    */

    const sellerProductSet =
      new Set(productIds);

    const sellerOrders =
      (orders || []).map(
        (order) => ({
          ...order,
          order_items:
            (order.order_items ||
              []).filter(
                (item) =>
                  sellerProductSet.has(
                    item.product_id
                  )
              ),
        })
      );

    return res.status(200).json({
      success: true,
      orders:
        sellerOrders,
    });
  } catch (error) {
    next(error);
  }
};


/*
|--------------------------------------------------------------------------
| GET SELLER ORDER BY ID
|--------------------------------------------------------------------------
*/
export const getSellerOrderById = async (
  req,
  res,
  next
) => {
  try {
    const { id } =
      req.validated.params;

    /*
    |--------------------------------------------------------------------------
    | Get seller product IDs
    |--------------------------------------------------------------------------
    */

    const {
      data: products,
      error: productsError,
    } = await supabaseAdmin
      .from("products")
      .select("id")
      .eq(
        "seller_id",
        req.profile.id
      );

    if (productsError) {
      return res.status(500).json({
        success: false,
        message:
          "Unable to verify seller products",
      });
    }

    const productIds =
      (products || []).map(
        (product) => product.id
      );

    /*
    |--------------------------------------------------------------------------
    | Fetch order
    |--------------------------------------------------------------------------
    */

    const {
      data: order,
      error,
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
      .single();

    if (error || !order) {
      return res.status(404).json({
        success: false,
        message:
          "Order not found",
      });
    }

    const sellerItems =
      (order.order_items ||
        []).filter((item) =>
        productIds.includes(
          item.product_id
        )
      );

    if (
      sellerItems.length === 0
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Order not found for this seller",
      });
    }

    return res.status(200).json({
      success: true,
      order: {
        ...order,
        order_items:
          sellerItems,
      },
    });
  } catch (error) {
    next(error);
  }
};


/*
|--------------------------------------------------------------------------
| UPDATE SELLER ORDER STATUS
|--------------------------------------------------------------------------
*/
export const updateSellerOrderStatus =
  async (req, res, next) => {
    try {
      const { id } =
        req.validated.params;

      const {
        order_status,
      } = req.body;

      const allowedStatuses = [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ];

      if (
        !allowedStatuses.includes(
          order_status
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid order status",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | Find seller products
      |--------------------------------------------------------------------------
      */

      const {
        data: products,
        error: productsError,
      } = await supabaseAdmin
        .from("products")
        .select("id")
        .eq(
          "seller_id",
          req.profile.id
        );

      if (productsError) {
        return res.status(500).json({
          success: false,
          message:
            "Unable to verify seller products",
        });
      }

      const productIds =
        (products || []).map(
          (product) => product.id
        );

      /*
      |--------------------------------------------------------------------------
      | Check order ownership
      |--------------------------------------------------------------------------
      */

      const {
        data: items,
        error: itemsError,
      } = await supabaseAdmin
        .from("order_items")
        .select(
          "product_id"
        )
        .eq(
          "order_id",
          id
        )
        .in(
          "product_id",
          productIds
        );

      if (
        itemsError ||
        !items ||
        items.length === 0
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Order not found for this seller",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | Get current order
      |--------------------------------------------------------------------------
      */

      const {
        data: currentOrder,
        error: currentError,
      } = await supabaseAdmin
        .from("orders")
        .select(
          "id, order_status, payment_status"
        )
        .eq("id", id)
        .single();

      if (
        currentError ||
        !currentOrder
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Order not found",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | Basic status transition protection
      |--------------------------------------------------------------------------
      */

      const transitions = {
        pending: [
          "confirmed",
          "cancelled",
        ],

        confirmed: [
          "processing",
          "cancelled",
        ],

        processing: [
          "shipped",
        ],

        shipped: [
          "delivered",
        ],

        delivered: [],

        cancelled: [],
      };

      const allowedNext =
        transitions[
          currentOrder
            .order_status
        ] || [];

      if (
        order_status !==
          currentOrder.order_status &&
        !allowedNext.includes(
          order_status
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            `Cannot change order status from ${currentOrder.order_status} to ${order_status}`,
        });
      }

      /*
      |--------------------------------------------------------------------------
      | Paid order requirement
      |--------------------------------------------------------------------------
      |
      | Once Razorpay is integrated, payment verification will move
      | orders from pending → confirmed.
      |
      |--------------------------------------------------------------------------
      */

      if (
        order_status ===
          "confirmed" &&
        currentOrder.payment_status !==
          "paid"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Order must be paid before confirmation",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | Update
      |--------------------------------------------------------------------------
      */

      const {
        data: updatedOrder,
        error: updateError,
      } = await supabaseAdmin
        .from("orders")
        .update({
          order_status,
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", id)
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
        .single();

      if (
        updateError ||
        !updatedOrder
      ) {
        return res.status(400).json({
          success: false,
          message:
            updateError?.message ||
            "Unable to update order status",
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Order status updated successfully",
        order:
          updatedOrder,
      });
    } catch (error) {
      next(error);
    }
  };