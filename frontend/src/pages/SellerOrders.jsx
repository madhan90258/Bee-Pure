import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Eye,
  X,
  Package,
  User,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  CalendarDays,
  Loader2,
  AlertCircle,
} from "lucide-react";

import { supabase } from "../lib/supabase";
import "../styles/SellerOrders.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

/*
|--------------------------------------------------------------------------
| STATUS HELPERS
|--------------------------------------------------------------------------
*/

const orderStatuses = [
  "Pending",
  "Confirmed",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const paymentStatuses = [
  "Pending",
  "Paid",
  "Failed",
  "Refunded",
];

const getStatusClass = (status) => {
  return String(status || "")
    .toLowerCase()
    .replace(/\s+/g, "-");
};

const formatStatus = (status) => {
  if (!status) {
    return "Unknown";
  }

  return (
    status.charAt(0).toUpperCase() +
    status.slice(1)
  );
};

const formatPrice = (amount) => {
  return `₹${Number(amount || 0).toLocaleString(
    "en-IN"
  )}`;
};

const formatDate = (date) => {
  if (!date) {
    return "-";
  }

  return new Date(date).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

const formatDateTime = (date) => {
  if (!date) {
    return "-";
  }

  return new Date(date).toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
};

/*
|--------------------------------------------------------------------------
| VALID STATUS TRANSITIONS
|--------------------------------------------------------------------------
*/

const statusTransitions = {
  Pending: [
    "Pending",
    "Confirmed",
    "Cancelled",
  ],

  Confirmed: [
    "Confirmed",
    "Processing",
    "Cancelled",
  ],

  Processing: [
    "Processing",
    "Shipped",
  ],

  Shipped: [
    "Shipped",
    "Delivered",
  ],

  Delivered: [
    "Delivered",
  ],

  Cancelled: [
    "Cancelled",
  ],
};

const getAvailableStatuses = (
  currentStatus
) => {
  return (
    statusTransitions[currentStatus] || [
      currentStatus,
    ]
  );
};

/*
|--------------------------------------------------------------------------
| AUTH
|--------------------------------------------------------------------------
*/

const getAccessToken = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.access_token || null;
};

/*
|--------------------------------------------------------------------------
| NORMALIZE BACKEND ORDER
|--------------------------------------------------------------------------
*/

const normalizeOrder = (order) => {
  const items = order?.order_items || [];

  const customerName =
    order?.shipping_full_name ||
    "Customer";

  const customerPhone =
    order?.shipping_phone || "-";

  const addressParts = [
    order?.shipping_address_line_1,
    order?.shipping_address_line_2,
    order?.shipping_city,
    order?.shipping_state,
    order?.shipping_pincode,
  ].filter(Boolean);

  return {
    id:
      order?.id ||
      order?.order_number ||
      "",

    orderNumber:
      order?.order_number ||
      order?.id ||
      "",

    date:
      order?.created_at || null,

    customer: {
      name: customerName,
      phone: customerPhone,
      email:
        order?.customer_email ||
        order?.user_email ||
        "",
    },

    items: items.map((item) => ({
      id: item.id,

      productId:
        item.product_id || null,

      name:
        item.product_name ||
        "Product",

      quantity:
        Number(item.quantity) || 0,

      price:
        Number(item.unit_price) || 0,

      subtotal:
        Number(item.subtotal) || 0,
    })),

    subtotal:
      Number(order?.subtotal) || 0,

    discount:
      Number(order?.discount) || 0,

    shipping:
      Number(order?.shipping_fee) || 0,

    total:
      Number(order?.total_amount) || 0,

    paymentStatus:
      formatStatus(
        order?.payment_status
      ),

    orderStatus:
      formatStatus(
        order?.order_status
      ),

    paymentMethod:
      order?.payment_method ||
      "Not available",

    address:
      addressParts.join(", ") ||
      "Address not available",

    raw: order,
  };
};

/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

function SellerOrders() {
  const [orders, setOrders] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [updatingOrderId, setUpdatingOrderId] =
    useState(null);

  const [loadingOrderId, setLoadingOrderId] =
    useState(null);

  const [searchQuery, setSearchQuery] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [paymentFilter, setPaymentFilter] =
    useState("All");

  const [selectedOrder, setSelectedOrder] =
    useState(null);

  const [orderDetailsError, setOrderDetailsError] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | LOAD SELLER ORDERS
  |--------------------------------------------------------------------------
  */

  const loadOrders = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const token =
        await getAccessToken();

      if (!token) {
        throw new Error(
          "Please login again."
        );
      }

      const response = await fetch(
        `${API_URL}/api/seller/orders`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Unable to load seller orders."
        );
      }

      const backendOrders =
        result.orders ||
        result.data?.orders ||
        [];

      setOrders(
        backendOrders.map(
          normalizeOrder
        )
      );
    } catch (error) {
      console.error(
        "Load seller orders error:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to load seller orders."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | INITIAL LOAD
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    loadOrders();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | UPDATE ORDER STATUS
  |--------------------------------------------------------------------------
  */

  const updateOrderStatus = async (
    orderId,
    newStatus
  ) => {
    try {
      setUpdatingOrderId(
        orderId
      );

      setErrorMessage("");

      const token =
        await getAccessToken();

      if (!token) {
        throw new Error(
          "Your session has expired. Please login again."
        );
      }

      const response = await fetch(
        `${API_URL}/api/seller/orders/${orderId}/status`,
        {
          method: "PATCH",

          headers: {
            Authorization:
              `Bearer ${token}`,

            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            order_status:
              newStatus.toLowerCase(),
          }),
        }
      );

      const result =
        await response.json();

      /*
      |--------------------------------------------------------------------------
      | BACKEND ERROR
      |--------------------------------------------------------------------------
      */

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Unable to update order status."
        );
      }

      /*
      |--------------------------------------------------------------------------
      | UPDATED ORDER
      |--------------------------------------------------------------------------
      */

      const updatedOrder =
        result.order ||
        result.data?.order ||
        null;

      if (!updatedOrder) {
        throw new Error(
          "Order status was updated, but the server did not return the order."
        );
      }

      const normalizedOrder =
        normalizeOrder(
          updatedOrder
        );

      /*
      |--------------------------------------------------------------------------
      | UPDATE TABLE
      |--------------------------------------------------------------------------
      */

      setOrders(
        (currentOrders) =>
          currentOrders.map(
            (order) =>
              order.id === orderId
                ? normalizedOrder
                : order
          )
      );

      /*
      |--------------------------------------------------------------------------
      | UPDATE OPEN MODAL
      |--------------------------------------------------------------------------
      */

      setSelectedOrder(
        (currentOrder) =>
          currentOrder?.id === orderId
            ? normalizedOrder
            : currentOrder
      );
    } catch (error) {
      console.error(
        "Update seller order status error:",
        error
      );

      /*
      |--------------------------------------------------------------------------
      | SHOW BACKEND ERROR
      |--------------------------------------------------------------------------
      */

      setErrorMessage(
        error.message ||
          "Unable to update order status."
      );

      /*
      |--------------------------------------------------------------------------
      | RELOAD FROM BACKEND
      |--------------------------------------------------------------------------
      |
      | This makes sure the dropdown returns to the
      | actual database status if the update failed.
      |
      |--------------------------------------------------------------------------
      */

      await loadOrders();
    } finally {
      setUpdatingOrderId(
        null
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | LOAD SINGLE ORDER
  |--------------------------------------------------------------------------
  */

  const openOrderDetails = async (
    order
  ) => {
    try {
      setSelectedOrder(order);

      setOrderDetailsError("");

      setLoadingOrderId(
        order.id
      );

      const token =
        await getAccessToken();

      if (!token) {
        throw new Error(
          "Please login again."
        );
      }

      const response = await fetch(
        `${API_URL}/api/seller/orders/${order.id}`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Unable to load order details."
        );
      }

      const backendOrder =
        result.order ||
        result.data?.order ||
        null;

      if (!backendOrder) {
        throw new Error(
          "Order details were not found."
        );
      }

      setSelectedOrder(
        normalizeOrder(
          backendOrder
        )
      );
    } catch (error) {
      console.error(
        "Load seller order details error:",
        error
      );

      setOrderDetailsError(
        error.message ||
          "Unable to load order details."
      );
    } finally {
      setLoadingOrderId(
        null
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | FILTER ORDERS
  |--------------------------------------------------------------------------
  */

  const filteredOrders =
    useMemo(() => {
      const query =
        searchQuery
          .trim()
          .toLowerCase();

      return orders.filter(
        (order) => {
          const matchesSearch =
            !query ||
            order.orderNumber
              .toLowerCase()
              .includes(query) ||
            order.customer.name
              .toLowerCase()
              .includes(query) ||
            order.customer.phone
              .toLowerCase()
              .includes(query) ||
            order.customer.email
              .toLowerCase()
              .includes(query);

          const matchesStatus =
            statusFilter === "All" ||
            order.orderStatus ===
              statusFilter;

          const matchesPayment =
            paymentFilter === "All" ||
            order.paymentStatus ===
              paymentFilter;

          return (
            matchesSearch &&
            matchesStatus &&
            matchesPayment
          );
        }
      );
    }, [
      orders,
      searchQuery,
      statusFilter,
      paymentFilter,
    ]);

  /*
  |--------------------------------------------------------------------------
  | SUMMARY
  |--------------------------------------------------------------------------
  */

  const totalOrders =
    orders.length;

  const processingOrders =
    orders.filter(
      (order) =>
        order.orderStatus ===
        "Processing"
    ).length;

  const deliveredOrders =
    orders.filter(
      (order) =>
        order.orderStatus ===
        "Delivered"
    ).length;

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <main className="seller-orders-page">
        <div className="seller-orders-container">
          <div className="seller-orders-empty">
            <Loader2
              size={40}
              className="seller-orders-spinner"
            />

            <strong>
              Loading orders...
            </strong>

            <span>
              Please wait while we load
              your orders.
            </span>
          </div>
        </div>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (
    <main className="seller-orders-page">
      <div className="seller-orders-container">

        {/* ------------------------------------------------
            HEADER
        ------------------------------------------------ */}

        <div className="seller-orders-header">
          <div>
            <span className="seller-orders-eyebrow">
              SELLER PANEL
            </span>

            <h1>
              Orders
            </h1>

            <p>
              View and manage customer
              orders.
            </p>
          </div>

          <div className="seller-orders-summary">

            <div className="seller-orders-summary-card">
              <span>
                Total Orders
              </span>

              <strong>
                {totalOrders}
              </strong>
            </div>

            <div className="seller-orders-summary-card">
              <span>
                Processing
              </span>

              <strong>
                {processingOrders}
              </strong>
            </div>

            <div className="seller-orders-summary-card">
              <span>
                Delivered
              </span>

              <strong>
                {deliveredOrders}
              </strong>
            </div>

          </div>
        </div>

        {/* ------------------------------------------------
            ERROR MESSAGE
        ------------------------------------------------ */}

        {errorMessage && (
          <div className="seller-orders-error">
            <AlertCircle
              size={18}
            />

            <div>
              <strong>
                Something went wrong
              </strong>

              <span>
                {errorMessage}
              </span>
            </div>

            <button
              type="button"
              onClick={() =>
                setErrorMessage("")
              }
              aria-label="Close error"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* ------------------------------------------------
            FILTERS
        ------------------------------------------------ */}

        <div className="seller-orders-filters">

          <div className="seller-orders-search">
            <Search size={18} />

            <input
              type="search"
              placeholder="Search order ID or customer..."
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(
                  event.target.value
                )
              }
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
          >
            <option value="All">
              All Order Status
            </option>

            {orderStatuses.map(
              (status) => (
                <option
                  key={status}
                  value={status}
                >
                  {status}
                </option>
              )
            )}
          </select>

          <select
            value={paymentFilter}
            onChange={(event) =>
              setPaymentFilter(
                event.target.value
              )
            }
          >
            <option value="All">
              All Payment Status
            </option>

            {paymentStatuses.map(
              (status) => (
                <option
                  key={status}
                  value={status}
                >
                  {status}
                </option>
              )
            )}
          </select>

        </div>

        {/* ------------------------------------------------
            DESKTOP TABLE
        ------------------------------------------------ */}

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
                  Date
                </th>

                <th>
                  Total
                </th>

                <th>
                  Payment
                </th>

                <th>
                  Order Status
                </th>

                <th>
                  Action
                </th>
              </tr>
            </thead>

            <tbody>

              {filteredOrders.length > 0 ? (
                filteredOrders.map(
                  (order) => {

                    const isUpdating =
                      updatingOrderId ===
                      order.id;

                    return (
                      <tr
                        key={order.id}
                      >

                        {/* Order */}

                        <td>
                          <strong className="seller-order-id">
                            #
                            {order.orderNumber}
                          </strong>

                          <span className="seller-order-items">
                            {order.items.length}{" "}
                            item
                            {order.items.length !==
                            1
                              ? "s"
                              : ""}
                          </span>
                        </td>

                        {/* Customer */}

                        <td>
                          <div className="seller-order-customer">
                            <strong>
                              {
                                order
                                  .customer
                                  .name
                              }
                            </strong>

                            {order
                              .customer
                              .email && (
                              <span>
                                {
                                  order
                                    .customer
                                    .email
                                }
                              </span>
                            )}

                            {order
                              .customer
                              .phone && (
                              <span>
                                {
                                  order
                                    .customer
                                    .phone
                                }
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Date */}

                        <td>
                          <span className="seller-order-date">
                            <CalendarDays
                              size={14}
                            />

                            {formatDate(
                              order.date
                            )}
                          </span>
                        </td>

                        {/* Total */}

                        <td>
                          <strong>
                            {formatPrice(
                              order.total
                            )}
                          </strong>
                        </td>

                        {/* Payment */}

                        <td>
                          <span
                            className={`seller-status seller-status-${getStatusClass(
                              order.paymentStatus
                            )}`}
                          >
                            {
                              order.paymentStatus
                            }
                          </span>
                        </td>

                        {/* Order Status */}

                        <td>
                          <select
                            className={`seller-order-status-select seller-order-status-${getStatusClass(
                              order.orderStatus
                            )}`}
                            value={
                              order.orderStatus
                            }
                            disabled={
                              isUpdating
                            }
                            onChange={(
                              event
                            ) =>
                              updateOrderStatus(
                                order.id,
                                event
                                  .target
                                  .value
                              )
                            }
                          >
                            {getAvailableStatuses(
                              order.orderStatus
                            ).map(
                              (
                                status
                              ) => (
                                <option
                                  key={
                                    status
                                  }
                                  value={
                                    status
                                  }
                                >
                                  {isUpdating &&
                                  status ===
                                    order.orderStatus
                                    ? "Updating..."
                                    : status}
                                </option>
                              )
                            )}
                          </select>
                        </td>

                        {/* View */}

                        <td>
                          <button
                            type="button"
                            className="seller-order-view-btn"
                            onClick={() =>
                              openOrderDetails(
                                order
                              )
                            }
                            disabled={
                              loadingOrderId ===
                              order.id
                            }
                          >
                            {loadingOrderId ===
                            order.id ? (
                              <Loader2
                                size={17}
                                className="seller-orders-spinner"
                              />
                            ) : (
                              <Eye
                                size={17}
                              />
                            )}

                            View
                          </button>
                        </td>

                      </tr>
                    );
                  }
                )
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="seller-orders-empty"
                  >
                    <Package
                      size={40}
                    />

                    <strong>
                      No orders found
                    </strong>

                    <span>
                      Try changing your
                      search or filters.
                    </span>
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>

        {/* ------------------------------------------------
            MOBILE ORDERS
        ------------------------------------------------ */}

        <div className="seller-orders-mobile-list">

          {filteredOrders.length > 0 ? (
            filteredOrders.map(
              (order) => (

                <article
                  key={order.id}
                  className="seller-order-mobile-card"
                >

                  <div className="seller-order-mobile-top">

                    <div>
                      <strong>
                        #
                        {
                          order.orderNumber
                        }
                      </strong>

                      <span>
                        {formatDate(
                          order.date
                        )}
                      </span>
                    </div>

                    <strong>
                      {formatPrice(
                        order.total
                      )}
                    </strong>

                  </div>

                  <div className="seller-order-mobile-customer">
                    <User
                      size={16}
                    />

                    <span>
                      {
                        order
                          .customer
                          .name
                      }
                    </span>
                  </div>

                  <div className="seller-order-mobile-statuses">

                    <span
                      className={`seller-status seller-status-${getStatusClass(
                        order.paymentStatus
                      )}`}
                    >
                      {
                        order.paymentStatus
                      }
                    </span>

                    <span
                      className={`seller-status seller-status-${getStatusClass(
                        order.orderStatus
                      )}`}
                    >
                      {
                        order.orderStatus
                      }
                    </span>

                  </div>

                  <button
                    type="button"
                    className="seller-order-mobile-view"
                    onClick={() =>
                      openOrderDetails(
                        order
                      )
                    }
                  >
                    <Eye
                      size={17}
                    />

                    View Order
                  </button>

                </article>
              )
            )
          ) : (
            <div className="seller-orders-mobile-empty">
              <Package
                size={40}
              />

              <strong>
                No orders found
              </strong>
            </div>
          )}

        </div>

      </div>

      {/* ------------------------------------------------
          ORDER DETAILS MODAL
      ------------------------------------------------ */}

      {selectedOrder && (
        <div
          className="seller-order-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setSelectedOrder(
                null
              );

              setOrderDetailsError(
                ""
              );
            }
          }}
        >

          <div className="seller-order-modal">

            {/* Modal Header */}

            <div className="seller-order-modal-header">

              <div>
                <span>
                  ORDER DETAILS
                </span>

                <h2>
                  #
                  {
                    selectedOrder.orderNumber
                  }
                </h2>
              </div>

              <button
                type="button"
                className="seller-order-modal-close"
                onClick={() => {
                  setSelectedOrder(
                    null
                  );

                  setOrderDetailsError(
                    ""
                  );
                }}
                aria-label="Close order details"
              >
                <X size={22} />
              </button>

            </div>

            {/* Modal Body */}

            <div className="seller-order-modal-body">

              {orderDetailsError && (
                <div className="seller-orders-error">
                  <AlertCircle
                    size={18}
                  />

                  <div>
                    <strong>
                      Unable to load details
                    </strong>

                    <span>
                      {
                        orderDetailsError
                      }
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setOrderDetailsError(
                        ""
                      )
                    }
                    aria-label="Close error"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}

              {/* Customer */}

              <section className="seller-order-detail-section">

                <h3>
                  <User size={18} />
                  Customer Details
                </h3>

                <div className="seller-order-detail-grid">

                  <div>
                    <span>
                      Name
                    </span>

                    <strong>
                      {
                        selectedOrder
                          .customer
                          .name
                      }
                    </strong>
                  </div>

                  <div>
                    <span>
                      Phone
                    </span>

                    <strong>
                      <Phone
                        size={14}
                      />

                      {
                        selectedOrder
                          .customer
                          .phone
                      }
                    </strong>
                  </div>

                  <div>
                    <span>
                      Email
                    </span>

                    <strong>
                      <Mail
                        size={14}
                      />

                      {selectedOrder
                        .customer
                        .email ||
                        "Not available"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Order Date
                    </span>

                    <strong>
                      {formatDateTime(
                        selectedOrder.date
                      )}
                    </strong>
                  </div>

                </div>

              </section>

              {/* Address */}

              <section className="seller-order-detail-section">

                <h3>
                  <MapPin
                    size={18}
                  />

                  Delivery Address
                </h3>

                <p className="seller-order-address">
                  {
                    selectedOrder.address
                  }
                </p>

              </section>

              {/* Products */}

              <section className="seller-order-detail-section">

                <h3>
                  <Package
                    size={18}
                  />

                  Ordered Products
                </h3>

                <div className="seller-order-products">

                  {selectedOrder.items.map(
                    (
                      item,
                      index
                    ) => {

                      const itemTotal =
                        Number(
                          item.price
                        ) *
                        Number(
                          item.quantity
                        );

                      return (
                        <div
                          className="seller-order-product-row"
                          key={
                            item.id ||
                            `${item.name}-${index}`
                          }
                        >

                          <div>
                            <strong>
                              {
                                item.name
                              }
                            </strong>

                            <span>
                              {formatPrice(
                                item.price
                              )}{" "}
                              ×{" "}
                              {
                                item.quantity
                              }
                            </span>
                          </div>

                          <strong>
                            {formatPrice(
                              itemTotal
                            )}
                          </strong>

                        </div>
                      );
                    }
                  )}

                </div>

              </section>

              {/* Payment */}

              <section className="seller-order-detail-section">

                <h3>
                  <CreditCard
                    size={18}
                  />

                  Payment
                </h3>

                <div className="seller-order-payment-grid">

                  <div>
                    <span>
                      Method
                    </span>

                    <strong>
                      {
                        selectedOrder.paymentMethod
                      }
                    </strong>
                  </div>

                  <div>
                    <span>
                      Status
                    </span>

                    <strong>
                      {
                        selectedOrder.paymentStatus
                      }
                    </strong>
                  </div>

                </div>

              </section>

              {/* Total */}

              <section className="seller-order-total-section">

                <div>
                  <span>
                    Subtotal
                  </span>

                  <strong>
                    {formatPrice(
                      selectedOrder.subtotal
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Discount
                  </span>

                  <strong>
                    -{" "}
                    {formatPrice(
                      selectedOrder.discount
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Shipping
                  </span>

                  <strong>
                    {formatPrice(
                      selectedOrder.shipping
                    )}
                  </strong>
                </div>

                <div className="seller-order-total-final">
                  <span>
                    Total
                  </span>

                  <strong>
                    {formatPrice(
                      selectedOrder.total
                    )}
                  </strong>
                </div>

              </section>

              {/* Current Status */}

              <section className="seller-order-detail-section">

                <h3>
                  <Package
                    size={18}
                  />

                  Order Status
                </h3>

                <div>
                  <select
                    className={`seller-order-status-select seller-order-status-${getStatusClass(
                      selectedOrder.orderStatus
                    )}`}
                    value={
                      selectedOrder.orderStatus
                    }
                    disabled={
                      updatingOrderId ===
                      selectedOrder.id
                    }
                    onChange={(
                      event
                    ) =>
                      updateOrderStatus(
                        selectedOrder.id,
                        event
                          .target
                          .value
                      )
                    }
                  >
                    {getAvailableStatuses(
                      selectedOrder.orderStatus
                    ).map(
                      (status) => (
                        <option
                          key={
                            status
                          }
                          value={
                            status
                          }
                        >
                          {status}
                        </option>
                      )
                    )}
                  </select>
                </div>

              </section>

            </div>

          </div>

        </div>
      )}

    </main>
  );
}

export default SellerOrders;