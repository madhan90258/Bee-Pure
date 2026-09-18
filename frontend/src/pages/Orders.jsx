import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import "../styles/Orders.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const getAccessToken = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.access_token || null;
};

const formatCurrency = (amount) => {
  return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
};

const formatDate = (date) => {
  if (!date) return "";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getStatusIcon = (status) => {
  switch (status) {
    case "delivered":
      return <CheckCircle size={20} />;

    case "shipped":
      return <Truck size={20} />;

    case "processing":
    case "confirmed":
      return <Package size={20} />;

    case "cancelled":
      return <XCircle size={20} />;

    default:
      return <Clock size={20} />;
  }
};

const getStatusLabel = (status) => {
  switch (status) {
    case "pending":
      return "Order Placed";

    case "confirmed":
      return "Confirmed";

    case "processing":
      return "Processing";

    case "shipped":
      return "Shipped";

    case "delivered":
      return "Delivered";

    case "cancelled":
      return "Cancelled";

    default:
      return status || "Unknown";
  }
};

const getPaymentLabel = (status) => {
  switch (status) {
    case "paid":
      return "Paid";

    case "pending":
      return "Payment Pending";

    case "failed":
      return "Payment Failed";

    case "refunded":
      return "Refunded";

    case "cancelled":
      return "Payment Cancelled";

    default:
      return status || "Unknown";
  }
};

const Orders = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const token = await getAccessToken();

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(`${API_URL}/api/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to load orders");
      }

      const orderList =
        result.orders ||
        result.data?.orders ||
        result.data ||
        [];

      setOrders(Array.isArray(orderList) ? orderList : []);
    } catch (err) {
      console.error("Load orders error:", err);
      setError(err.message || "Unable to load your orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <div className="orders-page">
      <div className="orders-container">
        <div className="orders-header">
          <button
            type="button"
            className="orders-back-button"
            onClick={() => navigate("/account")}
          >
            <ArrowLeft size={18} />
            Back to Account
          </button>

          <div className="orders-title">
            <Package size={30} />
            <div>
              <h1>My Orders</h1>
              <p>View and track your Bee Pure orders</p>
            </div>
          </div>
        </div>

        {loading && (
          <div className="orders-state">
            <Loader2 className="orders-spinner" size={34} />
            <p>Loading your orders...</p>
          </div>
        )}

        {!loading && error && (
          <div className="orders-state orders-error">
            <XCircle size={34} />
            <h3>Unable to load orders</h3>
            <p>{error}</p>

            <button
              type="button"
              className="orders-retry-button"
              onClick={loadOrders}
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="orders-state orders-empty">
            <Package size={60} />

            <h2>No orders yet</h2>

            <p>
              You haven't placed any orders yet. Start shopping
              from our collection of natural and organic products.
            </p>

            <Link to="/shop" className="orders-shop-button">
              Start Shopping
            </Link>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="orders-list">
            {orders.map((order) => {
              const orderId = order.id;
              const orderNumber =
                order.order_number || `#${orderId}`;

              return (
                <Link
                  key={orderId}
                  to={`/orders/${orderId}`}
                  className="order-card"
                >
                  <div className="order-card-top">
                    <div className="order-info">
                      <span className="order-label">
                        Order
                      </span>

                      <strong>{orderNumber}</strong>

                      <span className="order-date">
                        {formatDate(order.created_at)}
                      </span>
                    </div>

                    <ChevronRight
                      className="order-arrow"
                      size={22}
                    />
                  </div>

                  <div className="order-card-middle">
                    <div
                      className={`order-status order-status-${order.order_status}`}
                    >
                      {getStatusIcon(order.order_status)}

                      <div>
                        <span>Status</span>
                        <strong>
                          {getStatusLabel(order.order_status)}
                        </strong>
                      </div>
                    </div>

                    <div
                      className={`order-payment order-payment-${order.payment_status}`}
                    >
                      <span>Payment</span>
                      <strong>
                        {getPaymentLabel(order.payment_status)}
                      </strong>
                    </div>

                    <div className="order-total">
                      <span>Total</span>
                      <strong>
                        {formatCurrency(order.total_amount)}
                      </strong>
                    </div>
                  </div>

                  <div className="order-card-bottom">
                    <span>
                      {order.item_count
                        ? `${order.item_count} item${
                            order.item_count > 1 ? "s" : ""
                          }`
                        : "View order details"}
                    </span>

                    <span className="view-order">
                      View Details
                      <ChevronRight size={16} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;