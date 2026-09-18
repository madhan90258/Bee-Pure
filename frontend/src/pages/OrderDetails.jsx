import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  MapPin,
  Phone,
  Loader2,
  AlertCircle,
  ShoppingBag,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import "../styles/OrderDetails.css";

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
    month: "long",
    year: "numeric",
  });
};

const formatDateTime = (date) => {
  if (!date) return "";

  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusIcon = (status) => {
  switch (status) {
    case "delivered":
      return <CheckCircle size={22} />;

    case "shipped":
      return <Truck size={22} />;

    case "processing":
    case "confirmed":
      return <Package size={22} />;

    case "cancelled":
      return <XCircle size={22} />;

    default:
      return <Clock size={22} />;
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

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [error, setError] = useState("");
  const [cancelError, setCancelError] = useState("");
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const loadOrder = async () => {
    try {
      setLoading(true);
      setError("");

      const token = await getAccessToken();

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(`${API_URL}/api/orders/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to load order");
      }

      const orderData =
        result.order ||
        result.data?.order ||
        result.data ||
        null;

      if (!orderData) {
        throw new Error("Order details were not found");
      }

      setOrder(orderData);
    } catch (err) {
      console.error("Load order error:", err);
      setError(err.message || "Unable to load order details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadOrder();
    }
  }, [id]);

  const handleCancelOrder = async () => {
    try {
      setCancelLoading(true);
      setCancelError("");

      const token = await getAccessToken();

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        `${API_URL}/api/orders/${id}/cancel`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to cancel order"
        );
      }

      const updatedOrder =
        result.order ||
        result.data?.order ||
        result.data ||
        null;

      if (updatedOrder) {
        setOrder((currentOrder) => ({
          ...currentOrder,
          ...updatedOrder,
          order_status:
            updatedOrder.order_status || "cancelled",
        }));
      } else {
        await loadOrder();
      }

      setShowCancelConfirm(false);
    } catch (err) {
      console.error("Cancel order error:", err);
      setCancelError(
        err.message || "Unable to cancel this order"
      );
    } finally {
      setCancelLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="order-details-page">
        <div className="order-details-container">
          <div className="order-details-state">
            <Loader2
              size={36}
              className="order-details-spinner"
            />
            <p>Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="order-details-page">
        <div className="order-details-container">
          <div className="order-details-state order-details-error">
            <AlertCircle size={42} />

            <h2>Unable to load order</h2>

            <p>
              {error || "The requested order could not be found."}
            </p>

            <div className="order-error-actions">
              <button
                type="button"
                onClick={loadOrder}
                className="order-retry-button"
              >
                Try Again
              </button>

              <button
                type="button"
                onClick={() => navigate("/orders")}
                className="order-back-button"
              >
                Back to Orders
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const items =
    order.order_items ||
    order.items ||
    [];

  const address = {
    full_name: order.shipping_full_name,
    phone: order.shipping_phone,
    address_line_1: order.shipping_address_line_1,
    address_line_2: order.shipping_address_line_2,
    city: order.shipping_city,
    state: order.shipping_state,
    pincode: order.shipping_pincode,
  };

  const canCancel =
    order.order_status === "pending" &&
    order.payment_status !== "paid";

  return (
    <div className="order-details-page">
      <div className="order-details-container">

        {/* Header */}

        <div className="order-details-header">
          <button
            type="button"
            className="order-details-back"
            onClick={() => navigate("/orders")}
          >
            <ArrowLeft size={18} />
            Back to Orders
          </button>

          <div className="order-details-title-row">
            <div>
              <h1>Order Details</h1>

              <p>
                Order{" "}
                <strong>
                  {order.order_number || `#${order.id}`}
                </strong>
              </p>
            </div>

            <div
              className={`order-details-status order-details-status-${order.order_status}`}
            >
              {getStatusIcon(order.order_status)}

              <div>
                <span>Order Status</span>
                <strong>
                  {getStatusLabel(order.order_status)}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Order information */}

        <div className="order-details-info-grid">

          <div className="order-info-card">
            <span className="order-info-label">
              Order Date
            </span>

            <strong>
              {formatDateTime(order.created_at)}
            </strong>
          </div>

          <div className="order-info-card">
            <span className="order-info-label">
              Payment Status
            </span>

            <strong
              className={`payment-status payment-${order.payment_status}`}
            >
              {getPaymentLabel(order.payment_status)}
            </strong>
          </div>

          <div className="order-info-card">
            <span className="order-info-label">
              Total Amount
            </span>

            <strong className="order-total-highlight">
              {formatCurrency(order.total_amount)}
            </strong>
          </div>

        </div>

        {/* Main content */}

        <div className="order-details-layout">

          {/* Left */}

          <div className="order-details-main">

            {/* Products */}

            <section className="order-details-card">
              <div className="order-section-heading">
                <div>
                  <ShoppingBag size={20} />
                  <h2>Ordered Items</h2>
                </div>

                <span>
                  {items.length}{" "}
                  {items.length === 1 ? "item" : "items"}
                </span>
              </div>

              {items.length === 0 ? (
                <div className="order-no-items">
                  <Package size={30} />
                  <p>No item details available.</p>
                </div>
              ) : (
                <div className="order-items-list">
                  {items.map((item) => {
                    const productId =
                      item.product_id ||
                      item.product?.id;

                    const productImage =
                      item.product?.image_url ||
                      item.product?.image ||
                      item.image_url ||
                      item.image ||
                      "/products/img1.png";

                    return (
                      <div
                        className="order-product-item"
                        key={item.id || productId}
                      >
                        <div className="order-product-image">
                          {productId ? (
                            <Link
                              to={`/product/${productId}`}
                              onClick={(event) =>
                                event.stopPropagation()
                              }
                            >
                              <img
                                src={productImage}
                                alt={
                                  item.product_name ||
                                  "Product"
                                }
                              />
                            </Link>
                          ) : (
                            <img
                              src={productImage}
                              alt={
                                item.product_name ||
                                "Product"
                              }
                            />
                          )}
                        </div>

                        <div className="order-product-info">
                          <h3>
                            {item.product_name ||
                              item.product?.name ||
                              "Product"}
                          </h3>

                          <p>
                            Quantity:{" "}
                            <strong>
                              {item.quantity}
                            </strong>
                          </p>

                          <p>
                            Unit Price:{" "}
                            <strong>
                              {formatCurrency(
                                item.unit_price
                              )}
                            </strong>
                          </p>
                        </div>

                        <div className="order-product-price">
                          <span>Subtotal</span>

                          <strong>
                            {formatCurrency(
                              item.subtotal ||
                                Number(item.unit_price || 0) *
                                  Number(item.quantity || 0)
                            )}
                          </strong>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Shipping address */}

            <section className="order-details-card">
              <div className="order-section-heading">
                <div>
                  <MapPin size={20} />
                  <h2>Shipping Address</h2>
                </div>
              </div>

              <div className="order-shipping-address">
                <strong>{address.full_name}</strong>

                {address.phone && (
                  <p className="shipping-phone">
                    <Phone size={15} />
                    {address.phone}
                  </p>
                )}

                <p>{address.address_line_1}</p>

                {address.address_line_2 && (
                  <p>{address.address_line_2}</p>
                )}

                <p>
                  {address.city}, {address.state} -{" "}
                  {address.pincode}
                </p>
              </div>
            </section>

          </div>

          {/* Right */}

          <aside className="order-details-sidebar">

            {/* Price summary */}

            <section className="order-details-card order-summary-card">
              <div className="order-section-heading">
                <div>
                  <Package size={20} />
                  <h2>Order Summary</h2>
                </div>
              </div>

              <div className="order-summary-lines">

                <div>
                  <span>Subtotal</span>

                  <strong>
                    {formatCurrency(order.subtotal)}
                  </strong>
                </div>

                <div>
                  <span>Shipping</span>

                  <strong>
                    {Number(order.shipping_fee || 0) === 0
                      ? "Free"
                      : formatCurrency(order.shipping_fee)}
                  </strong>
                </div>

                {Number(order.discount || 0) > 0 && (
                  <div className="order-discount-line">
                    <span>Discount</span>

                    <strong>
                      -{formatCurrency(order.discount)}
                    </strong>
                  </div>
                )}

                <div className="order-summary-total">
                  <span>Total</span>

                  <strong>
                    {formatCurrency(order.total_amount)}
                  </strong>
                </div>

              </div>
            </section>

            {/* Cancel */}

            {canCancel && (
              <section className="order-cancel-section">

                {!showCancelConfirm ? (
                  <button
                    type="button"
                    className="cancel-order-button"
                    onClick={() =>
                      setShowCancelConfirm(true)
                    }
                  >
                    <XCircle size={18} />
                    Cancel Order
                  </button>
                ) : (
                  <div className="cancel-confirm-box">
                    <h3>Cancel this order?</h3>

                    <p>
                      Are you sure you want to cancel this
                      order? This action cannot be undone.
                    </p>

                    {cancelError && (
                      <div className="cancel-error">
                        <AlertCircle size={16} />
                        {cancelError}
                      </div>
                    )}

                    <div className="cancel-actions">
                      <button
                        type="button"
                        className="keep-order-button"
                        disabled={cancelLoading}
                        onClick={() => {
                          setShowCancelConfirm(false);
                          setCancelError("");
                        }}
                      >
                        Keep Order
                      </button>

                      <button
                        type="button"
                        className="confirm-cancel-button"
                        disabled={cancelLoading}
                        onClick={handleCancelOrder}
                      >
                        {cancelLoading ? (
                          <>
                            <Loader2
                              size={16}
                              className="order-details-spinner"
                            />
                            Cancelling...
                          </>
                        ) : (
                          "Yes, Cancel"
                        )}
                      </button>
                    </div>
                  </div>
                )}

              </section>
            )}

            {/* Payment note */}

            {order.payment_status === "pending" &&
              order.order_status !== "cancelled" && (
                <div className="order-payment-note">
                  <Clock size={18} />

                  <p>
                    Payment is currently pending. Online
                    payment will be available when the payment
                    gateway is connected.
                  </p>
                </div>
              )}

            {order.order_status === "cancelled" && (
              <div className="order-cancelled-note">
                <XCircle size={18} />

                <p>
                  This order has been cancelled.
                </p>
              </div>
            )}

          </aside>

        </div>
      </div>
    </div>
  );
};

export default OrderDetails;