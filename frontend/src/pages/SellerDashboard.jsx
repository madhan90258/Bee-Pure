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
} from "lucide-react";

import { Link } from "react-router-dom";

import "../styles/SellerDashboard.css";


// =====================================================
// FRONTEND DEMO DATA
// =====================================================
// These values will later come from Supabase.
// =====================================================

const dashboardStats = {
  totalOrders: 128,
  totalProducts: 24,
  totalCategories: 8,
  totalMessages: 17,
  totalReviews: 86,
  totalCoupons: 12,
  totalSales: 184650,
  pendingOrders: 14,
};


// =====================================================
// SALES DATA
// =====================================================

const salesData = [
  {
    month: "Jan",
    sales: 18500,
  },
  {
    month: "Feb",
    sales: 22400,
  },
  {
    month: "Mar",
    sales: 19800,
  },
  {
    month: "Apr",
    sales: 27600,
  },
  {
    month: "May",
    sales: 31200,
  },
  {
    month: "Jun",
    sales: 35800,
  },
];


// =====================================================
// ORDER STATUS DATA
// =====================================================

const orderStatusData = [
  {
    name: "Delivered",
    value: 78,
    className: "delivered",
  },
  {
    name: "Processing",
    value: 22,
    className: "processing",
  },
  {
    name: "Shipped",
    value: 18,
    className: "shipped",
  },
  {
    name: "Cancelled",
    value: 10,
    className: "cancelled",
  },
];


// =====================================================
// PRODUCT PERFORMANCE
// =====================================================

const productPerformance = [
  {
    name: "Forest Honey",
    sales: 82,
  },
  {
    name: "Wildflower Honey",
    sales: 69,
  },
  {
    name: "Organic Turmeric",
    sales: 57,
  },
  {
    name: "Raw Peanut",
    sales: 45,
  },
  {
    name: "Farm Ghee",
    sales: 38,
  },
];


// =====================================================
// RECENT ORDERS
// =====================================================

const recentOrders = [
  {
    id: "#BP-1028",
    customer: "Arun Kumar",
    product: "Forest Honey",
    amount: 899,
    status: "Delivered",
  },
  {
    id: "#BP-1027",
    customer: "Priya Sharma",
    product: "Organic Turmeric",
    amount: 549,
    status: "Processing",
  },
  {
    id: "#BP-1026",
    customer: "Rahul Verma",
    product: "Wildflower Honey",
    amount: 749,
    status: "Shipped",
  },
  {
    id: "#BP-1025",
    customer: "Anjali R",
    product: "Farm Ghee",
    amount: 1299,
    status: "Delivered",
  },
  {
    id: "#BP-1024",
    customer: "Vikram Singh",
    product: "Raw Peanut",
    amount: 399,
    status: "Cancelled",
  },
];


// =====================================================
// HELPERS
// =====================================================

const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
};


// =====================================================
// COMPONENT
// =====================================================

function SellerDashboard() {
  // -----------------------------------------------------
  // SALES GRAPH CALCULATIONS
  // -----------------------------------------------------

  const maxSales = Math.max(
    ...salesData.map((item) => item.sales)
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

  const salesPoints = salesData.map(
    (item, index) => {

      const x =
        graphPaddingLeft +
        (index *
          usableWidth) /
          (salesData.length - 1);

      const y =
        graphPaddingTop +
        usableHeight -
        (item.sales / maxSales) *
          usableHeight;

      return {
        ...item,
        x,
        y,
      };
    }
  );

  const linePath = salesPoints
    .map((point, index) => {
      return `${index === 0 ? "M" : "L"} ${
        point.x
      } ${point.y}`;
    })
    .join(" ");

  const areaPath = `
    M ${salesPoints[0].x} ${graphHeight - graphPaddingBottom}
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
    } ${graphHeight - graphPaddingBottom}
    Z
  `;

  // -----------------------------------------------------
  // ORDER STATUS TOTAL
  // -----------------------------------------------------

  const totalOrderStatuses =
    orderStatusData.reduce(
      (total, item) =>
        total + item.value,
      0
    );

  let currentPercentage = 0;

  const pieSegments =
    orderStatusData.map((item) => {

      const percentage =
        (item.value /
          totalOrderStatuses) *
        100;

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
    });

  // -----------------------------------------------------
  // PAGE
  // -----------------------------------------------------

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


          {/* BACK TO ACCOUNT */}

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

              <small className="stat-positive">
                <TrendingUp size={12} />
                12.5% this month
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
                Active products
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
                Product categories
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
                Customer messages
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
                Customer reviews
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
                Available coupons
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

              <small className="stat-positive">
                <TrendingUp size={12} />
                18.4% this month
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
                  Total sales
                </small>

              </div>

            </div>


            <div className="seller-line-chart">

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
                    <span key={item.month}>
                      {item.month}
                    </span>
                  )
                )}

              </div>

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
                  Current order distribution
                </p>

              </div>

            </div>


            <div className="seller-order-status-content">

              <div
                className="seller-pie-chart"
                style={{
                  background: `conic-gradient(
                    from 0deg,
                    ${pieSegments
                      .map(
                        (segment) =>
                          `var(--chart-${segment.className}) ${segment.start}% ${segment.end}%`
                      )
                      .join(", ")}
                  )`,
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
                          {item.name}
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

              {productPerformance.map(
                (product, index) => {

                  const percentage =
                    (product.sales / 82) *
                    100;

                  return (
                    <div
                      className="seller-bar-item"
                      key={product.name}
                    >

                      <div className="seller-bar-label">

                        <span>
                          {product.name}
                        </span>

                        <strong>
                          {product.sales}
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

              <div className="seller-activity-item">

                <div className="seller-activity-icon">
                  <Users size={18} />
                </div>

                <div>

                  <strong>
                    Customer Messages
                  </strong>

                  <span>
                    {dashboardStats.totalMessages} messages waiting
                  </span>

                </div>

                <Link to="/seller/messages">
                  <Eye size={17} />
                </Link>

              </div>


              <div className="seller-activity-item">

                <div className="seller-activity-icon">
                  <Star size={18} />
                </div>

                <div>

                  <strong>
                    Customer Reviews
                  </strong>

                  <span>
                    {dashboardStats.totalReviews} reviews received
                  </span>

                </div>

                <Link to="/seller/reviews">
                  <Eye size={17} />
                </Link>

              </div>


              <div className="seller-activity-item">

                <div className="seller-activity-icon">
                  <Package size={18} />
                </div>

                <div>

                  <strong>
                    Products
                  </strong>

                  <span>
                    {dashboardStats.totalProducts} products listed
                  </span>

                </div>

                <Link to="/seller/products">
                  <Eye size={17} />
                </Link>

              </div>


              <div className="seller-activity-item">

                <div className="seller-activity-icon">
                  <FolderTree size={18} />
                </div>

                <div>

                  <strong>
                    Categories
                  </strong>

                  <span>
                    {dashboardStats.totalCategories} categories active
                  </span>

                </div>

                <Link to="/seller/categories">
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
                Latest customer orders
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
                  (order) => (
                    <tr key={order.id}>

                      <td>
                        <strong>
                          {order.id}
                        </strong>
                      </td>

                      <td>
                        {order.customer}
                      </td>

                      <td>
                        {order.product}
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
                          className={`seller-order-status-badge ${order.status
                            .toLowerCase()
                            .replace(
                              " ",
                              "-"
                            )}`}
                        >

                          {order.status ===
                            "Delivered" && (
                            <CheckCircle size={13} />
                          )}

                          {order.status ===
                            "Processing" && (
                            <Clock3 size={13} />
                          )}

                          {order.status ===
                            "Shipped" && (
                            <Truck size={13} />
                          )}

                          {order.status ===
                            "Cancelled" && (
                            <XCircle size={13} />
                          )}

                          {order.status}

                        </span>

                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>

        </section>

      </div>

    </main>
  );
}

export default SellerDashboard;