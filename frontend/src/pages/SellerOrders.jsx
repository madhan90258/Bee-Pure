import { useMemo, useState } from "react";
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
} from "lucide-react";

import "../styles/SellerOrders.css";

function SellerOrders() {
  const [orders, setOrders] = useState([
    {
      id: "BP1001",
      date: "08 Sep 2026",
      customer: {
        name: "Arun Kumar",
        phone: "+91 98765 43210",
        email: "arun@example.com",
      },
      items: [
        {
          name: "Pure Forest Honey",
          quantity: 2,
          price: 499,
        },
        {
          name: "Organic Turmeric",
          quantity: 1,
          price: 199,
        },
      ],
      subtotal: 1197,
      discount: 100,
      shipping: 0,
      total: 1097,
      paymentMethod: "Razorpay",
      paymentStatus: "Paid",
      orderStatus: "Processing",
      address:
        "12, Green Street, Coimbatore, Tamil Nadu - 641001",
    },

    {
      id: "BP1002",
      date: "07 Sep 2026",
      customer: {
        name: "Priya S",
        phone: "+91 91234 56789",
        email: "priya@example.com",
      },
      items: [
        {
          name: "Organic A2 Ghee",
          quantity: 1,
          price: 699,
        },
      ],
      subtotal: 699,
      discount: 0,
      shipping: 50,
      total: 749,
      paymentMethod: "Cash on Delivery",
      paymentStatus: "Pending",
      orderStatus: "Pending",
      address:
        "24, Lake View Road, Chennai, Tamil Nadu - 600028",
    },

    {
      id: "BP1003",
      date: "06 Sep 2026",
      customer: {
        name: "Rahul M",
        phone: "+91 99887 77665",
        email: "rahul@example.com",
      },
      items: [
        {
          name: "Raw Organic Honey",
          quantity: 1,
          price: 399,
        },
        {
          name: "Natural Jaggery",
          quantity: 2,
          price: 249,
        },
      ],
      subtotal: 897,
      discount: 50,
      shipping: 0,
      total: 847,
      paymentMethod: "Razorpay",
      paymentStatus: "Paid",
      orderStatus: "Shipped",
      address:
        "8, Market Road, Madurai, Tamil Nadu - 625001",
    },

    {
      id: "BP1004",
      date: "04 Sep 2026",
      customer: {
        name: "Meena R",
        phone: "+91 90000 11223",
        email: "meena@example.com",
      },
      items: [
        {
          name: "Forest Bee Honey",
          quantity: 1,
          price: 549,
        },
      ],
      subtotal: 549,
      discount: 0,
      shipping: 0,
      total: 549,
      paymentMethod: "Razorpay",
      paymentStatus: "Paid",
      orderStatus: "Delivered",
      address:
        "31, Temple Street, Salem, Tamil Nadu - 636001",
    },

    {
      id: "BP1005",
      date: "02 Sep 2026",
      customer: {
        name: "Vignesh K",
        phone: "+91 95555 66777",
        email: "vignesh@example.com",
      },
      items: [
        {
          name: "Pure Forest Honey",
          quantity: 1,
          price: 499,
        },
      ],
      subtotal: 499,
      discount: 0,
      shipping: 0,
      total: 499,
      paymentMethod: "Razorpay",
      paymentStatus: "Refunded",
      orderStatus: "Cancelled",
      address:
        "17, Main Road, Erode, Tamil Nadu - 638001",
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);

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

  const filteredOrders = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        !query ||
        order.id.toLowerCase().includes(query) ||
        order.customer.name.toLowerCase().includes(query) ||
        order.customer.email.toLowerCase().includes(query) ||
        order.customer.phone.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" ||
        order.orderStatus === statusFilter;

      const matchesPayment =
        paymentFilter === "All" ||
        order.paymentStatus === paymentFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPayment
      );
    });
  }, [
    orders,
    searchQuery,
    statusFilter,
    paymentFilter,
  ]);

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              orderStatus: newStatus,
            }
          : order
      )
    );

    setSelectedOrder((currentOrder) =>
      currentOrder?.id === orderId
        ? {
            ...currentOrder,
            orderStatus: newStatus,
          }
        : currentOrder
    );
  };

  const getStatusClass = (status) => {
    return status
      .toLowerCase()
      .replace(/\s+/g, "-");
  };

  return (
    <main className="seller-orders-page">
      <div className="seller-orders-container">

        {/* Header */}

        <div className="seller-orders-header">
          <div>
            <span className="seller-orders-eyebrow">
              SELLER PANEL
            </span>

            <h1>Orders</h1>

            <p>
              View and manage customer orders.
            </p>
          </div>

          <div className="seller-orders-summary">
            <div className="seller-orders-summary-card">
              <span>Total Orders</span>
              <strong>{orders.length}</strong>
            </div>

            <div className="seller-orders-summary-card">
              <span>Processing</span>
              <strong>
                {
                  orders.filter(
                    (order) =>
                      order.orderStatus ===
                      "Processing"
                  ).length
                }
              </strong>
            </div>

            <div className="seller-orders-summary-card">
              <span>Delivered</span>
              <strong>
                {
                  orders.filter(
                    (order) =>
                      order.orderStatus ===
                      "Delivered"
                  ).length
                }
              </strong>
            </div>
          </div>
        </div>


        {/* Filters */}

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
              setStatusFilter(event.target.value)
            }
          >
            <option value="All">
              All Order Status
            </option>

            {orderStatuses.map((status) => (
              <option
                key={status}
                value={status}
              >
                {status}
              </option>
            ))}
          </select>


          <select
            value={paymentFilter}
            onChange={(event) =>
              setPaymentFilter(event.target.value)
            }
          >
            <option value="All">
              All Payment Status
            </option>

            {paymentStatuses.map((status) => (
              <option
                key={status}
                value={status}
              >
                {status}
              </option>
            ))}
          </select>

        </div>


        {/* Orders Table */}

        <div className="seller-orders-table-wrapper">

          <table className="seller-orders-table">

            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Order Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (

                  <tr key={order.id}>

                    <td>
                      <strong className="seller-order-id">
                        #{order.id}
                      </strong>

                      <span className="seller-order-items">
                        {order.items.length} item
                        {order.items.length !== 1
                          ? "s"
                          : ""}
                      </span>
                    </td>


                    <td>
                      <div className="seller-order-customer">
                        <strong>
                          {order.customer.name}
                        </strong>

                        <span>
                          {order.customer.email}
                        </span>
                      </div>
                    </td>


                    <td>
                      <span className="seller-order-date">
                        <CalendarDays size={14} />
                        {order.date}
                      </span>
                    </td>


                    <td>
                      <strong>
                        ₹{order.total.toLocaleString("en-IN")}
                      </strong>
                    </td>


                    <td>
                      <span
                        className={`seller-status seller-status-${getStatusClass(
                          order.paymentStatus
                        )}`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>


                    <td>

                      <select
                        className={`seller-order-status-select seller-order-status-${getStatusClass(
                          order.orderStatus
                        )}`}
                        value={order.orderStatus}
                        onChange={(event) =>
                          updateOrderStatus(
                            order.id,
                            event.target.value
                          )
                        }
                      >

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

                    </td>


                    <td>

                      <button
                        type="button"
                        className="seller-order-view-btn"
                        onClick={() =>
                          setSelectedOrder(order)
                        }
                      >
                        <Eye size={17} />
                        View
                      </button>

                    </td>

                  </tr>

                ))
              ) : (

                <tr>

                  <td
                    colSpan="7"
                    className="seller-orders-empty"
                  >
                    <Package size={40} />

                    <strong>
                      No orders found
                    </strong>

                    <span>
                      Try changing your search or filters.
                    </span>
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>


        {/* Mobile Order Cards */}

        <div className="seller-orders-mobile-list">

          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (

              <article
                key={order.id}
                className="seller-order-mobile-card"
              >

                <div className="seller-order-mobile-top">

                  <div>
                    <strong>
                      #{order.id}
                    </strong>

                    <span>
                      {order.date}
                    </span>
                  </div>

                  <strong>
                    ₹{order.total.toLocaleString("en-IN")}
                  </strong>

                </div>


                <div className="seller-order-mobile-customer">

                  <User size={16} />

                  <span>
                    {order.customer.name}
                  </span>

                </div>


                <div className="seller-order-mobile-statuses">

                  <span
                    className={`seller-status seller-status-${getStatusClass(
                      order.paymentStatus
                    )}`}
                  >
                    {order.paymentStatus}
                  </span>

                  <span
                    className={`seller-status seller-status-${getStatusClass(
                      order.orderStatus
                    )}`}
                  >
                    {order.orderStatus}
                  </span>

                </div>


                <button
                  type="button"
                  className="seller-order-mobile-view"
                  onClick={() =>
                    setSelectedOrder(order)
                  }
                >
                  <Eye size={17} />
                  View Order
                </button>

              </article>

            ))
          ) : (
            <div className="seller-orders-mobile-empty">
              <Package size={40} />
              <strong>No orders found</strong>
            </div>
          )}

        </div>

      </div>


      {/* Order Details Modal */}

      {selectedOrder && (

        <div
          className="seller-order-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              setSelectedOrder(null);
            }
          }}
        >

          <div className="seller-order-modal">

            <div className="seller-order-modal-header">

              <div>
                <span>
                  ORDER DETAILS
                </span>

                <h2>
                  #{selectedOrder.id}
                </h2>
              </div>

              <button
                type="button"
                className="seller-order-modal-close"
                onClick={() =>
                  setSelectedOrder(null)
                }
                aria-label="Close order details"
              >
                <X size={22} />
              </button>

            </div>


            <div className="seller-order-modal-body">

              {/* Customer */}

              <section className="seller-order-detail-section">

                <h3>
                  <User size={18} />
                  Customer Details
                </h3>

                <div className="seller-order-detail-grid">

                  <div>
                    <span>Name</span>
                    <strong>
                      {selectedOrder.customer.name}
                    </strong>
                  </div>

                  <div>
                    <span>Phone</span>
                    <strong>
                      <Phone size={14} />
                      {selectedOrder.customer.phone}
                    </strong>
                  </div>

                  <div>
                    <span>Email</span>
                    <strong>
                      <Mail size={14} />
                      {selectedOrder.customer.email}
                    </strong>
                  </div>

                  <div>
                    <span>Order Date</span>
                    <strong>
                      {selectedOrder.date}
                    </strong>
                  </div>

                </div>

              </section>


              {/* Address */}

              <section className="seller-order-detail-section">

                <h3>
                  <MapPin size={18} />
                  Delivery Address
                </h3>

                <p className="seller-order-address">
                  {selectedOrder.address}
                </p>

              </section>


              {/* Products */}

              <section className="seller-order-detail-section">

                <h3>
                  <Package size={18} />
                  Ordered Products
                </h3>

                <div className="seller-order-products">

                  {selectedOrder.items.map(
                    (item, index) => {

                      const itemTotal =
                        item.price *
                        item.quantity;

                      return (
                        <div
                          className="seller-order-product-row"
                          key={`${item.name}-${index}`}
                        >

                          <div>
                            <strong>
                              {item.name}
                            </strong>

                            <span>
                              ₹
                              {item.price.toLocaleString(
                                "en-IN"
                              )}{" "}
                              × {item.quantity}
                            </span>
                          </div>

                          <strong>
                            ₹
                            {itemTotal.toLocaleString(
                              "en-IN"
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
                  <CreditCard size={18} />
                  Payment
                </h3>

                <div className="seller-order-payment-grid">

                  <div>
                    <span>Method</span>
                    <strong>
                      {selectedOrder.paymentMethod}
                    </strong>
                  </div>

                  <div>
                    <span>Status</span>
                    <strong>
                      {selectedOrder.paymentStatus}
                    </strong>
                  </div>

                </div>

              </section>


              {/* Total */}

              <section className="seller-order-total-section">

                <div>
                  <span>Subtotal</span>
                  <strong>
                    ₹
                    {selectedOrder.subtotal.toLocaleString(
                      "en-IN"
                    )}
                  </strong>
                </div>

                <div>
                  <span>Discount</span>
                  <strong>
                    - ₹
                    {selectedOrder.discount.toLocaleString(
                      "en-IN"
                    )}
                  </strong>
                </div>

                <div>
                  <span>Shipping</span>
                  <strong>
                    ₹
                    {selectedOrder.shipping.toLocaleString(
                      "en-IN"
                    )}
                  </strong>
                </div>

                <div className="seller-order-grand-total">
                  <span>Total</span>
                  <strong>
                    ₹
                    {selectedOrder.total.toLocaleString(
                      "en-IN"
                    )}
                  </strong>
                </div>

              </section>


              {/* Status */}

              <section className="seller-order-update-section">

                <label htmlFor="order-status">
                  Update Order Status
                </label>

                <select
                  id="order-status"
                  value={selectedOrder.orderStatus}
                  onChange={(event) =>
                    updateOrderStatus(
                      selectedOrder.id,
                      event.target.value
                    )
                  }
                >

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

              </section>

            </div>

          </div>

        </div>

      )}

    </main>
  );
}

export default SellerOrders;