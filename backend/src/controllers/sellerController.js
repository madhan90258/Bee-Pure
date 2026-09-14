import { supabaseAdmin } from "../config/supabase.js";


/*
|--------------------------------------------------------------------------
| SELLER DASHBOARD
|--------------------------------------------------------------------------
*/
export const getSellerDashboard = async (
  req,
  res,
  next
) => {
  try {
    const sellerId =
      req.profile.id;

    /*
    |--------------------------------------------------------------------------
    | Products
    |--------------------------------------------------------------------------
    */

    const {
      data: products,
      error: productsError,
    } = await supabaseAdmin
      .from("products")
      .select(
        "id, name, price, stock_quantity, is_active"
      )
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

    /*
    |--------------------------------------------------------------------------
    | Order items belonging to seller products
    |--------------------------------------------------------------------------
    */

    let orderItems = [];

    if (productIds.length > 0) {
      const {
        data,
        error,
      } = await supabaseAdmin
        .from("order_items")
        .select(`
          id,
          order_id,
          product_id,
          quantity,
          subtotal
        `)
        .in(
          "product_id",
          productIds
        );

      if (error) {
        return res.status(500).json({
          success: false,
          message:
            "Unable to fetch seller sales",
        });
      }

      orderItems = data || [];
    }

    const orderIds = [
      ...new Set(
        orderItems.map(
          (item) =>
            item.order_id
        )
      ),
    ];

    let orders = [];

    if (orderIds.length > 0) {
      const {
        data,
        error,
      } = await supabaseAdmin
        .from("orders")
        .select(
          "id, order_number, order_status, payment_status, total_amount, created_at"
        )
        .in(
          "id",
          orderIds
        );

      if (error) {
        return res.status(500).json({
          success: false,
          message:
            "Unable to fetch seller orders",
        });
      }

      orders = data || [];
    }

    /*
    |--------------------------------------------------------------------------
    | Calculate seller metrics
    |--------------------------------------------------------------------------
    */

    const validOrders =
      orders.filter(
        (order) =>
          order.order_status !==
            "cancelled" &&
          order.payment_status !==
            "refunded"
      );

    const validOrderIds =
      new Set(
        validOrders.map(
          (order) => order.id
        )
      );

    const sellerRevenue =
      orderItems
        .filter((item) =>
          validOrderIds.has(
            item.order_id
          )
        )
        .reduce(
          (sum, item) =>
            sum +
            Number(
              item.subtotal || 0
            ),
          0
        );

    const totalUnitsSold =
      orderItems
        .filter((item) =>
          validOrderIds.has(
            item.order_id
          )
        )
        .reduce(
          (sum, item) =>
            sum +
            Number(
              item.quantity || 0
            ),
          0
        );

    const lowStockProducts =
      (products || []).filter(
        (product) =>
          product.stock_quantity <=
          5
      );

    return res.status(200).json({
      success: true,
      dashboard: {
        total_products:
          products?.length || 0,

        active_products:
          (products || []).filter(
            (product) =>
              product.is_active
          ).length,

        total_orders:
          validOrders.length,

        total_units_sold:
          totalUnitsSold,

        total_sales:
          Math.round(
            sellerRevenue * 100
          ) / 100,

        low_stock_count:
          lowStockProducts.length,

        low_stock_products:
          lowStockProducts,
      },
    });
  } catch (error) {
    next(error);
  }
};