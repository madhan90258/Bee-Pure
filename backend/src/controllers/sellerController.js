import { supabaseAdmin } from "../config/supabase.js";

/*
|--------------------------------------------------------------------------
| SELLER DASHBOARD
|--------------------------------------------------------------------------
*/
export const getSellerDashboard = async (req, res, next) => {
  try {
    const sellerId = req.profile.id;

    /*
    |--------------------------------------------------------------------------
    | 1. SELLER PRODUCTS
    |--------------------------------------------------------------------------
    */

    const {
      data: products,
      error: productsError,
    } = await supabaseAdmin
      .from("products")
      .select(
        `
        id,
        name,
        price,
        stock_quantity,
        is_active
        `
      )
      .eq("seller_id", sellerId);

    if (productsError) {
      return res.status(500).json({
        success: false,
        message: "Unable to fetch seller products",
      });
    }

    const sellerProducts = products || [];

    const productIds = sellerProducts.map(
      (product) => product.id
    );

    /*
    |--------------------------------------------------------------------------
    | 2. BASIC PRODUCT STATISTICS
    |--------------------------------------------------------------------------
    */

    const totalProducts = sellerProducts.length;

    const activeProducts = sellerProducts.filter(
      (product) => product.is_active
    ).length;

    const lowStockProducts = sellerProducts.filter(
      (product) =>
        Number(product.stock_quantity || 0) <= 5
    );

    /*
    |--------------------------------------------------------------------------
    | 3. SELLER COUPONS
    |--------------------------------------------------------------------------
    */

    const {
      count: totalCoupons,
      error: couponsError,
    } = await supabaseAdmin
      .from("coupons")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("created_by", sellerId);

    if (couponsError) {
      return res.status(500).json({
        success: false,
        message: "Unable to fetch seller coupons",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | 4. SELLER ORDER ITEMS
    |--------------------------------------------------------------------------
    */

    let orderItems = [];

    if (productIds.length > 0) {
      const {
        data,
        error,
      } = await supabaseAdmin
        .from("order_items")
        .select(
          `
          id,
          order_id,
          product_id,
          product_name,
          unit_price,
          quantity,
          subtotal
          `
        )
        .in("product_id", productIds);

      if (error) {
        return res.status(500).json({
          success: false,
          message: "Unable to fetch seller order items",
        });
      }

      orderItems = data || [];
    }

    /*
    |--------------------------------------------------------------------------
    | 5. SELLER ORDER IDS
    |--------------------------------------------------------------------------
    */

    const orderIds = [
      ...new Set(
        orderItems.map(
          (item) => item.order_id
        )
      ),
    ];

    /*
    |--------------------------------------------------------------------------
    | 6. SELLER ORDERS
    |--------------------------------------------------------------------------
    */

    let orders = [];

    if (orderIds.length > 0) {
      const {
        data,
        error,
      } = await supabaseAdmin
        .from("orders")
        .select(
          `
          id,
          order_number,
          user_id,
          shipping_full_name,
          order_status,
          payment_status,
          total_amount,
          created_at
          `
        )
        .in("id", orderIds)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        return res.status(500).json({
          success: false,
          message: "Unable to fetch seller orders",
        });
      }

      orders = data || [];
    }

    /*
    |--------------------------------------------------------------------------
    | 7. ONLY PAID + NON-CANCELLED ORDERS
    |--------------------------------------------------------------------------
    |
    | Seller sales are counted only when payment_status = paid.
    |
    */

    const validOrders = orders.filter(
      (order) =>
        order.payment_status === "paid" &&
        order.order_status !== "cancelled"
    );

    const validOrderIds = new Set(
      validOrders.map(
        (order) => order.id
      )
    );

    const validOrderItems = orderItems.filter(
      (item) =>
        validOrderIds.has(item.order_id)
    );

    /*
    |--------------------------------------------------------------------------
    | 8. TOTAL SELLER SALES
    |--------------------------------------------------------------------------
    */

    const totalSales = validOrderItems.reduce(
      (sum, item) =>
        sum + Number(item.subtotal || 0),
      0
    );

    /*
    |--------------------------------------------------------------------------
    | 9. TOTAL UNITS SOLD
    |--------------------------------------------------------------------------
    */

    const totalUnitsSold = validOrderItems.reduce(
      (sum, item) =>
        sum + Number(item.quantity || 0),
      0
    );

    /*
    |--------------------------------------------------------------------------
    | 10. ORDER STATUS COUNTS
    |--------------------------------------------------------------------------
    */

    const orderStatusData = [
      {
        name: "Delivered",
        value: 0,
        className: "delivered",
      },
      {
        name: "Processing",
        value: 0,
        className: "processing",
      },
      {
        name: "Shipped",
        value: 0,
        className: "shipped",
      },
      {
        name: "Cancelled",
        value: 0,
        className: "cancelled",
      },
    ];

    validOrders.forEach((order) => {
      const status = order.order_status;

      const statusItem = orderStatusData.find(
        (item) =>
          item.name.toLowerCase() ===
          status
      );

      if (statusItem) {
        statusItem.value += 1;
      }
    });

    /*
    |--------------------------------------------------------------------------
    | 11. PENDING ORDERS
    |--------------------------------------------------------------------------
    */

    const pendingOrders = validOrders.filter(
      (order) =>
        order.order_status === "pending"
    ).length;

    /*
    |--------------------------------------------------------------------------
    | 12. PRODUCT PERFORMANCE
    |--------------------------------------------------------------------------
    */

    const productSalesMap = {};

    validOrderItems.forEach((item) => {
      const productId = item.product_id;

      if (!productSalesMap[productId]) {
        productSalesMap[productId] = {
          product_id: productId,
          name: item.product_name,
          units_sold: 0,
          sales: 0,
        };
      }

      productSalesMap[productId].units_sold +=
        Number(item.quantity || 0);

      productSalesMap[productId].sales +=
        Number(item.subtotal || 0);
    });

    const productPerformance = Object.values(
      productSalesMap
    )
      .sort(
        (a, b) =>
          b.units_sold -
          a.units_sold
      )
      .slice(0, 5);

    /*
    |--------------------------------------------------------------------------
    | 13. MONTHLY SALES
    |--------------------------------------------------------------------------
    */

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const monthlySalesMap = {};

    monthNames.forEach(
      (month) => {
        monthlySalesMap[month] = 0;
      }
    );

    validOrderItems.forEach((item) => {
      const order = validOrders.find(
        (currentOrder) =>
          currentOrder.id ===
          item.order_id
      );

      if (!order) return;

      const date = new Date(
        order.created_at
      );

      const month =
        monthNames[
          date.getMonth()
        ];

      monthlySalesMap[month] +=
        Number(item.subtotal || 0);
    });

    const salesData = monthNames.map(
      (month) => ({
        month,
        sales:
          Math.round(
            monthlySalesMap[month] *
              100
          ) / 100,
      })
    );

    /*
    |--------------------------------------------------------------------------
    | 14. RECENT ORDERS
    |--------------------------------------------------------------------------
    */

    const recentOrdersMap = {};

    validOrderItems.forEach(
      (item) => {
        const order =
          validOrders.find(
            (currentOrder) =>
              currentOrder.id ===
              item.order_id
          );

        if (!order) return;

        if (
          !recentOrdersMap[
            order.id
          ]
        ) {
          recentOrdersMap[
            order.id
          ] = {
            id: order.id,
            order_number:
              order.order_number,
            customer:
              order.shipping_full_name,
            product:
              item.product_name,
            amount: Number(
              item.subtotal || 0
            ),
            status:
              order.order_status,
            created_at:
              order.created_at,
          };
        }
      }
    );

    const recentOrders =
      Object.values(
        recentOrdersMap
      )
        .sort(
          (a, b) =>
            new Date(
              b.created_at
            ) -
            new Date(
              a.created_at
            )
        )
        .slice(0, 5);

    /*
    |--------------------------------------------------------------------------
    | 15. RESPONSE
    |--------------------------------------------------------------------------
    */

    return res.status(200).json({
      success: true,

      dashboard: {
        total_products:
          totalProducts,

        active_products:
          activeProducts,

        total_orders:
          validOrders.length,

        total_units_sold:
          totalUnitsSold,

        total_sales:
          Math.round(
            totalSales * 100
          ) / 100,

        pending_orders:
          pendingOrders,

        total_coupons:
          totalCoupons || 0,

        low_stock_count:
          lowStockProducts.length,

        low_stock_products:
          lowStockProducts,

        sales_data:
          salesData,

        order_status_data:
          orderStatusData,

        product_performance:
          productPerformance,

        recent_orders:
          recentOrders,
      },
    });
  } catch (error) {
    next(error);
  }
};