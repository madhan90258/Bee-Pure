import {
  ShoppingBag,
  Package,
  FolderTree,
  MessageSquare,
  Star,
  TicketPercent,
  IndianRupee,
  Clock3,
  ArrowLeft,
  TrendingUp,
  Users,
  CheckCircle,
  Truck,
  XCircle,
  Eye,
  Loader2,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { useEffect, useMemo, useState } from "react";

import { supabase } from "../lib/supabase";

import "../styles/SellerDashboard.css";


// =====================================================
// API CONFIG
// =====================================================

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";


// =====================================================
// HELPERS
// =====================================================

const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
};


const formatDate = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};


const getStatusLabel = (status) => {
  if (!status) return "Unknown";

  return (
    status.charAt(0).toUpperCase() +
    status.slice(1)
  );
};


// =====================================================
// COMPONENT
// =====================================================

function SellerDashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  // =====================================================
  // FETCH DASHBOARD
  // =====================================================

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const {
          data: {
            session,
          },
        } = await supabase.auth.getSession();

        if (!session?.access_token) {
          navigate("/login", {
            replace: true,
          });

          return;
        }

        const response = await fetch(
          `${API_URL}/api/seller/dashboard`,
          {
            method: "GET",

            headers: {
              Authorization: `Bearer ${session.access_token}`,
              "Content-Type":
                "application/json",
            },
          }
        );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result?.message ||
              "Unable to load seller dashboard."
          );
        }

        if (!result?.success) {
          throw new Error(
            result?.message ||
              "Unable to load seller dashboard."
          );
        }

        setDashboard(
          result.dashboard || {}
        );
      } catch (err) {
        console.error(
          "Seller dashboard error:",
          err
        );

        setError(
          err.message ||
            "Unable to load dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [navigate]);


  // =====================================================
  // SAFE DATA
  // =====================================================

  const dashboardStats = useMemo(() => {
    return {
      totalOrders:
        dashboard?.total_orders || 0,

      totalProducts:
        dashboard?.total_products || 0,

      totalCategories: "-",

      totalMessages: "-",

      totalReviews: "-",

      totalCoupons:
        dashboard?.total_coupons || 0,

      totalSales:
        dashboard?.total_sales || 0,

      pendingOrders:
        dashboard?.pending_orders || 0,
    };
  }, [dashboard]);


  const salesData =
    dashboard?.sales_data || [];


  const orderStatusData =
    dashboard?.order_status_data || [];


  const productPerformance =
    dashboard?.product_performance || [];


  const recentOrders =
    dashboard?.recent_orders || [];


  // =====================================================
  // SALES GRAPH CALCULATIONS
  // =====================================================

  const maxSales = Math.max(
    ...salesData.map(
      (item) =>
        Number(item.sales || 0)
    ),
    1
  );

  const graphWidth = 720;
  const graphHeight = 260;

  const graphPaddingLeft = 45;
  const graphPaddingRight = 20;
  const graphPaddingTop = 25;
  const graphPaddingBottom = 35;

  const usableWidth =
    graphWidth -
    graphPaddingLeft -
    graphPaddingRight;

  const usableHeight =
    graphHeight -
    graphPaddingTop -
    graphPaddingBottom;

  const salesPoints =
    salesData.map(
      (item, index) => {
        const x =
          salesData.length === 1
            ? graphPaddingLeft +
              usableWidth / 2
            : graphPaddingLeft +
              (index *
                usableWidth) /
                (salesData.length - 1);

        const y =
          graphPaddingTop +
          usableHeight -
          (Number(item.sales || 0) /
            maxSales) *
            usableHeight;

        return {
          ...item,
          x,
          y,
        };
      }
    );


  const linePath =
    salesPoints.length > 0
      ? salesPoints
          .map(
            (point, index) =>
              `${
                index === 0
                  ? "M"
                  : "L"
              } ${point.x} ${point.y}`
          )
          .join(" ")
      : "";


  const areaPath =
    salesPoints.length > 0
      ? `
        M ${salesPoints[0].x}
          ${
            graphHeight -
            graphPaddingBottom
          }

        ${salesPoints
          .map(
            (point) =>
              `L ${point.x} ${point.y}`
          )
          .join(" ")}

        L ${
          salesPoints[
            salesPoints.length - 1
          ].x
        }
        ${
          graphHeight -
          graphPaddingBottom
        }

        Z
      `
      : "";


  // =====================================================
  // ORDER STATUS
  // =====================================================

  const totalOrderStatuses =
    orderStatusData.reduce(
      (total, item) =>
        total +
        Number(item.value || 0),
      0
    );


  let currentPercentage = 0;

  const pieSegments =
    orderStatusData.map(
      (item) => {
        const percentage =
          totalOrderStatuses > 0
            ? (Number(
                item.value || 0
              ) /
                totalOrderStatuses) *
              100
            : 0;

        const start =
          currentPercentage;

        const end =
          currentPercentage +
          percentage;

        currentPercentage = end;

        return {
          ...item,
          start,
          end,
        };
      }
    );


  // =====================================================
  // PRODUCT PERFORMANCE MAX
  // =====================================================

  const maxProductSales =
    Math.max(
      ...productPerformance.map(
        (product) =>
          Number(
            product.units_sold || 0
          )
      ),
      1
    );


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="seller-dashboard-page">

        <div className="seller-dashboard-container">

          <div className="seller-dashboard-loading">

            <Loader2
              size={28}
              className="seller-dashboard-spinner"
            />

            <p>
              Loading seller dashboard...
            </p>

          </div>

        </div>

      </main>
    );
  }


  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <main className="seller-dashboard-page">

        <div className="seller-dashboard-container">

          <div className="seller-dashboard-error">

            <h2>
              Unable to load dashboard
            </h2>

            <p>
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                window.location.reload()
              }
            >
              Try Again
            </button>

          </div>

        </div>

      </main>
    );
  }


  // =====================================================
  // PAGE
  // =====================================================

  return (
    <main className="seller-dashboard-page">

      <div className="seller-dashboard-container">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="seller-dashboard-header">

          <div className="seller-dashboard-header-content">

            <p className="seller-dashboard-eyebrow">
              BEE PURE SELLER
            </p>

            <h1>
              Seller Dashboard
            </h1>

            <p className="seller-dashboard-subtitle">
              Monitor your store performance,
              orders and customer activity.
            </p>

          </div>


          <Link
            to="/seller/account"
            className="seller-back-account-button"
          >

            <ArrowLeft size={17} />

            <span>
              Back to Account
            </span>

          </Link>

        </header>


        {/* =================================================
            QUICK STATS
        ================================================= */}

        <section className="seller-dashboard-stats">

          {/* ORDERS */}

          <div className="seller-dashboard-stat-card">

            <div className="seller-dashboard-stat-icon orders">
              <ShoppingBag size={21} />
            </div>

            <div className="seller-dashboard-stat-content">

              <span>
                Total Orders
              </span>

              <strong>
                {dashboardStats.totalOrders}
              </strong>

              <small>
                Seller orders
              </small>

            </div>

          </div>


          {/* PRODUCTS */}

          <div className="seller-dashboard-stat-card">

            <div className="seller-dashboard-stat-icon products">
              <Package size={21} />
            </div>

            <div className="seller-dashboard-stat-content">

              <span>
                Total Products
              </span>

              <strong>
                {dashboardStats.totalProducts}
              </strong>

              <small>
                {dashboard?.active_products || 0} active products
              </small>

            </div>

          </div>


          {/* CATEGORIES */}

          <div className="seller-dashboard-stat-card">

            <div className="seller-dashboard-stat-icon categories">
              <FolderTree size={21} />
            </div>

            <div className="seller-dashboard-stat-content">

              <span>
                Categories
              </span>

              <strong>
                {dashboardStats.totalCategories}
              </strong>

              <small>
                Category management
              </small>

            </div>

          </div>


          {/* MESSAGES */}

          <div className="seller-dashboard-stat-card">

            <div className="seller-dashboard-stat-icon messages">
              <MessageSquare size={21} />
            </div>

            <div className="seller-dashboard-stat-content">

              <span>
                Messages
              </span>

              <strong>
                {dashboardStats.totalMessages}
              </strong>

              <small>
                Coming with Messages API
              </small>

            </div>

          </div>


          {/* REVIEWS */}

          <div className="seller-dashboard-stat-card">

            <div className="seller-dashboard-stat-icon reviews">
              <Star size={21} />
            </div>

            <div className="seller-dashboard-stat-content">

              <span>
                Reviews
              </span>

              <strong>
                {dashboardStats.totalReviews}
              </strong>

              <small>
                Coming with Reviews API
              </small>

            </div>

          </div>


          {/* COUPONS */}

          <div className="seller-dashboard-stat-card">

            <div className="seller-dashboard-stat-icon coupons">
              <TicketPercent size={21} />
            </div>

            <div className="seller-dashboard-stat-content">

              <span>
                Coupons
              </span>

              <strong>
                {dashboardStats.totalCoupons}
              </strong>

              <small>
                Seller coupons
              </small>

            </div>

          </div>


          {/* TOTAL SALES */}

          <div className="seller-dashboard-stat-card">

            <div className="seller-dashboard-stat-icon sales">
              <IndianRupee size={21} />
            </div>

            <div className="seller-dashboard-stat-content">

              <span>
                Total Sales
              </span>

              <strong>
                {formatCurrency(
                  dashboardStats.totalSales
                )}
              </strong>

              <small>
                Paid seller sales
              </small>

            </div>

          </div>


          {/* PENDING ORDERS */}

          <div className="seller-dashboard-stat-card">

            <div className="seller-dashboard-stat-icon pending">
              <Clock3 size={21} />
            </div>

            <div className="seller-dashboard-stat-content">

              <span>
                Pending Orders
              </span>

              <strong>
                {dashboardStats.pendingOrders}
              </strong>

              <small>
                Need attention
              </small>

            </div>

          </div>

        </section>


        {/* =================================================
            ANALYTICS ROW
        ================================================= */}

        <section className="seller-dashboard-analytics-grid">

          {/* =================================================
              SALES OVERVIEW
          ================================================= */}

          <div className="seller-dashboard-card seller-sales-card">

            <div className="seller-dashboard-card-header">

              <div>

                <span>
                  PERFORMANCE
                </span>

                <h2>
                  Sales Overview
                </h2>

                <p>
                  Monthly sales performance
                </p>

              </div>

              <div className="seller-chart-summary">

                <strong>
                  {formatCurrency(
                    dashboardStats.totalSales
                  )}
                </strong>

                <small>
                  Total paid sales
                </small>

              </div>

            </div>


            <div className="seller-line-chart">

              {salesPoints.length === 0 ? (
                <div className="seller-dashboard-empty-chart">
                  No sales data available yet.
                </div>
              ) : (
                <>
                  <svg
                    viewBox={`0 0 ${graphWidth} ${graphHeight}`}
                    preserveAspectRatio="none"
                    className="seller-line-chart-svg"
                  >

                    {/* GRID */}

                    <line
                      x1={graphPaddingLeft}
                      y1={graphPaddingTop}
                      x2={
                        graphWidth -
                        graphPaddingRight
                      }
                      y2={graphPaddingTop}
                      className="chart-grid-line"
                    />

                    <line
                      x1={graphPaddingLeft}
                      y1={
                        graphPaddingTop +
                        usableHeight / 2
                      }
                      x2={
                        graphWidth -
                        graphPaddingRight
                      }
                      y2={
                        graphPaddingTop +
                        usableHeight / 2
                      }
                      className="chart-grid-line"
                    />

                    <line
                      x1={graphPaddingLeft}
                      y1={
                        graphHeight -
                        graphPaddingBottom
                      }
                      x2={
                        graphWidth -
                        graphPaddingRight
                      }
                      y2={
                        graphHeight -
                        graphPaddingBottom
                      }
                      className="chart-grid-line"
                    />


                    {/* AREA */}

                    <path
                      d={areaPath}
                      className="sales-chart-area"
                    />


                    {/* LINE */}

                    <path
                      d={linePath}
                      className="sales-chart-line"
                    />


                    {/* POINTS */}

                    {salesPoints.map(
                      (point) => (
                        <circle
                          key={point.month}
                          cx={point.x}
                          cy={point.y}
                          r="5"
                          className="sales-chart-point"
                        />
                      )
                    )}

                  </svg>


                  {/* X AXIS */}

                  <div className="seller-chart-months">

                    {salesData.map(
                      (item) => (
                        <span
                          key={item.month}
                        >
                          {item.month}
                        </span>
                      )
                    )}

                  </div>
                </>
              )}

            </div>

          </div>


          {/* =================================================
              ORDER STATUS
          ================================================= */}

          <div className="seller-dashboard-card seller-order-status-card">

            <div className="seller-dashboard-card-header">

              <div>

                <span>
                  ORDERS
                </span>

                <h2>
                  Order Status
                </h2>

                <p>
                  Current paid order distribution
                </p>

              </div>

            </div>


            <div className="seller-order-status-content">

              <div
                className="seller-pie-chart"
                style={{
                  background:
                    totalOrderStatuses > 0
                      ? `conic-gradient(
                          from 0deg,
                          ${pieSegments
                            .map(
                              (
                                segment
                              ) =>
                                `var(--chart-${segment.className}) ${segment.start}% ${segment.end}%`
                            )
                            .join(", ")}
                        )`
                      : "var(--chart-empty)",
                }}
              >

                <div className="seller-pie-center">

                  <strong>
                    {totalOrderStatuses}
                  </strong>

                  <span>
                    Orders
                  </span>

                </div>

              </div>


              <div className="seller-order-legend">

                {orderStatusData.map(
                  (item) => (
                    <div
                      key={item.name}
                      className="seller-order-legend-item"
                    >

                      <div>

                        <span
                          className={`seller-legend-dot ${item.className}`}
                        />

                        <span>
                          {getStatusLabel(
                            item.name
                          )}
                        </span>

                      </div>

                      <strong>
                        {item.value}
                      </strong>

                    </div>
                  )
                )}

              </div>

            </div>

          </div>

        </section>


        {/* =================================================
            PRODUCT PERFORMANCE + ACTIVITY
        ================================================= */}

        <section className="seller-dashboard-lower-grid">

          {/* =================================================
              PRODUCT PERFORMANCE
          ================================================= */}

          <div className="seller-dashboard-card seller-product-performance">

            <div className="seller-dashboard-card-header">

              <div>

                <span>
                  PRODUCTS
                </span>

                <h2>
                  Product Performance
                </h2>

                <p>
                  Best performing products
                </p>

              </div>

              <Link
                to="/seller/products"
                className="seller-dashboard-view-link"
              >
                View Products
              </Link>

            </div>


            <div className="seller-bar-chart">

              {productPerformance.length === 0 ? (
                <div className="seller-dashboard-empty">
                  No product sales yet.
                </div>
              ) : (
                productPerformance.map(
                  (product) => {

                    const percentage =
                      (Number(
                        product.units_sold ||
                          0
                      ) /
                        maxProductSales) *
                      100;

                    return (
                      <div
                        className="seller-bar-item"
                        key={
                          product.product_id
                        }
                      >

                        <div className="seller-bar-label">

                          <span>
                            {product.name}
                          </span>

                          <strong>
                            {product.units_sold}
                          </strong>

                        </div>

                        <div className="seller-bar-track">

                          <div
                            className="seller-bar-fill"
                            style={{
                              width: `${percentage}%`,
                            }}
                          />

                        </div>

                      </div>
                    );
                  }
                )
              )}

            </div>

          </div>


          {/* =================================================
              STORE ACTIVITY
          ================================================= */}

          <div className="seller-dashboard-card seller-activity-card">

            <div className="seller-dashboard-card-header">

              <div>

                <span>
                  STORE
                </span>

                <h2>
                  Store Activity
                </h2>

                <p>
                  Current store overview
                </p>

              </div>

            </div>


            <div className="seller-activity-list">

              {/* PRODUCTS */}

              <div className="seller-activity-item">

                <div className="seller-activity-icon">
                  <Package size={18} />
                </div>

                <div>

                  <strong>
                    Products
                  </strong>

                  <span>
                    {dashboardStats.totalProducts}{" "}
                    products listed
                  </span>

                </div>

                <Link to="/seller/products">
                  <Eye size={17} />
                </Link>

              </div>


              {/* LOW STOCK */}

              <div className="seller-activity-item">

                <div className="seller-activity-icon">
                  <Clock3 size={18} />
                </div>

                <div>

                  <strong>
                    Low Stock
                  </strong>

                  <span>
                    {dashboard?.low_stock_count ||
                      0}{" "}
                    products need attention
                  </span>

                </div>

                <Link to="/seller/products">
                  <Eye size={17} />
                </Link>

              </div>


              {/* COUPONS */}

              <div className="seller-activity-item">

                <div className="seller-activity-icon">
                  <TicketPercent size={18} />
                </div>

                <div>

                  <strong>
                    Coupons
                  </strong>

                  <span>
                    {dashboardStats.totalCoupons}{" "}
                    seller coupons
                  </span>

                </div>

                <Link to="/seller/coupons">
                  <Eye size={17} />
                </Link>

              </div>


              {/* ORDERS */}

              <div className="seller-activity-item">

                <div className="seller-activity-icon">
                  <ShoppingBag size={18} />
                </div>

                <div>

                  <strong>
                    Pending Orders
                  </strong>

                  <span>
                    {dashboardStats.pendingOrders}{" "}
                    orders waiting
                  </span>

                </div>

                <Link to="/seller/orders">
                  <Eye size={17} />
                </Link>

              </div>

            </div>

          </div>

        </section>


        {/* =================================================
            RECENT ORDERS
        ================================================= */}

        <section className="seller-dashboard-card seller-recent-orders-card">

          <div className="seller-dashboard-card-header">

            <div>

              <span>
                ORDERS
              </span>

              <h2>
                Recent Orders
              </h2>

              <p>
                Latest paid customer orders
              </p>

            </div>

            <Link
              to="/seller/orders"
              className="seller-dashboard-view-link"
            >
              View All Orders
            </Link>

          </div>


          <div className="seller-orders-table-wrapper">

            {recentOrders.length === 0 ? (
              <div className="seller-dashboard-empty">
                No orders available yet.
              </div>
            ) : (
              <table className="seller-orders-table">

                <thead>

                  <tr>

                    <th>
                      Order
                    </th>

                    <th>
                      Customer
                    </th>

                    <th>
                      Product
                    </th>

                    <th>
                      Amount
                    </th>

                    <th>
                      Status
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {recentOrders.map(
                    (order) => {

                      const status =
                        order.status ||
                        "";

                      const statusClass =
                        status
                          .toLowerCase()
                          .replace(
                            /\s+/g,
                            "-"
                          );

                      return (
                        <tr
                          key={
                            order.id
                          }
                        >

                          <td>

                            <strong>
                              {order.order_number ||
                                order.id}
                            </strong>

                            <small
                              className="seller-order-date"
                            >
                              {formatDate(
                                order.created_at
                              )}
                            </small>

                          </td>

                          <td>
                            {order.customer ||
                              "Customer"}
                          </td>

                          <td>
                            {order.product ||
                              "-"}
                          </td>

                          <td>

                            <strong>
                              {formatCurrency(
                                order.amount
                              )}
                            </strong>

                          </td>

                          <td>

                            <span
                              className={`seller-order-status-badge ${statusClass}`}
                            >

                              {status ===
                                "delivered" && (
                                <CheckCircle
                                  size={13}
                                />
                              )}

                              {status ===
                                "processing" && (
                                <Clock3
                                  size={13}
                                />
                              )}

                              {status ===
                                "shipped" && (
                                <Truck
                                  size={13}
                                />
                              )}

                              {status ===
                                "cancelled" && (
                                <XCircle
                                  size={13}
                                />
                              )}

                              {status ===
                                "pending" && (
                                <Clock3
                                  size={13}
                                />
                              )}

                              {getStatusLabel(
                                status
                              )}

                            </span>

                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>
            )}

          </div>

        </section>

      </div>

    </main>
  );
}

export default SellerDashboard;