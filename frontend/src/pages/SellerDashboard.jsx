import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  FolderTree,
  TicketPercent,
  MessageSquare,
  Star,
  User,
  LogOut,
} from "lucide-react";

import { Link } from "react-router-dom";

import "../styles/SellerDashboard.css";

function SellerDashboard() {
  return (
    <main className="seller-dashboard-page">

      <div className="seller-dashboard-container">

        {/* =========================================
            HEADER
        ========================================= */}

        <div className="seller-dashboard-header">

          <div>
            <p className="seller-dashboard-eyebrow">
              BEE PURE SELLER
            </p>

            <h1>
              Seller Dashboard
            </h1>

            <p>
              Manage your products, orders and customers.
            </p>
          </div>

          <button
            type="button"
            className="seller-logout-button"
          >
            <LogOut size={17} />
            Logout
          </button>

        </div>


        {/* =========================================
            STATISTICS
        ========================================= */}

        <section className="seller-stats">

          <div className="seller-stat-card">
            <div className="seller-stat-icon">
              <ShoppingBag size={21} />
            </div>

            <div>
              <span>Total Orders</span>
              <strong>0</strong>
            </div>
          </div>


          <div className="seller-stat-card">
            <div className="seller-stat-icon">
              <Package size={21} />
            </div>

            <div>
              <span>Total Products</span>
              <strong>0</strong>
            </div>
          </div>


          <div className="seller-stat-card">
            <div className="seller-stat-icon">
              <FolderTree size={21} />
            </div>

            <div>
              <span>Categories</span>
              <strong>0</strong>
            </div>
          </div>


          <div className="seller-stat-card">
            <div className="seller-stat-icon">
              <MessageSquare size={21} />
            </div>

            <div>
              <span>Messages</span>
              <strong>0</strong>
            </div>
          </div>

        </section>


        {/* =========================================
            MANAGEMENT
        ========================================= */}

        <section className="seller-management">

          <div className="seller-section-heading">
            <div>
              <p>MANAGEMENT</p>
              <h2>Manage Bee Pure</h2>
            </div>
          </div>


          <div className="seller-management-grid">

            <Link
              to="/seller/products"
              className="seller-management-card"
            >
              <Package size={25} />

              <div>
                <h3>Products</h3>
                <p>
                  Add, update and delete products.
                </p>
              </div>
            </Link>


            <Link
              to="/seller/categories"
              className="seller-management-card"
            >
              <FolderTree size={25} />

              <div>
                <h3>Categories</h3>
                <p>
                  Manage your product categories.
                </p>
              </div>
            </Link>


            <Link
              to="/seller/orders"
              className="seller-management-card"
            >
              <ShoppingBag size={25} />

              <div>
                <h3>Orders</h3>
                <p>
                  View and manage customer orders.
                </p>
              </div>
            </Link>


            <Link
              to="/seller/coupons"
              className="seller-management-card"
            >
              <TicketPercent size={25} />

              <div>
                <h3>Coupons</h3>
                <p>
                  Create and manage discount coupons.
                </p>
              </div>
            </Link>


            <Link
              to="/seller/messages"
              className="seller-management-card"
            >
              <MessageSquare size={25} />

              <div>
                <h3>Messages</h3>
                <p>
                  View messages from customers.
                </p>
              </div>
            </Link>


            <Link
              to="/seller/reviews"
              className="seller-management-card"
            >
              <Star size={25} />

              <div>
                <h3>Reviews</h3>
                <p>
                  View customer product reviews.
                </p>
              </div>
            </Link>


            <Link
              to="/seller/account"
              className="seller-management-card"
            >
              <User size={25} />

              <div>
                <h3>Seller Account</h3>
                <p>
                  Manage username and password.
                </p>
              </div>
            </Link>

          </div>

        </section>


        {/* =========================================
            RECENT ORDERS
        ========================================= */}

        <section className="seller-recent-orders">

          <div className="seller-section-heading">

            <div>
              <p>ORDERS</p>

              <h2>
                Recent Orders
              </h2>
            </div>

            <Link to="/seller/orders">
              View All
            </Link>

          </div>


          <div className="seller-empty-orders">

            <ShoppingBag size={30} />

            <h3>
              No orders yet
            </h3>

            <p>
              Customer orders will appear here
              once your store starts receiving orders.
            </p>

          </div>

        </section>

      </div>

    </main>
  );
}

export default SellerDashboard;