import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  TicketPercent,
  CheckCircle,
  XCircle,
  CalendarDays,
  Users,
  IndianRupee,
} from "lucide-react";

import { supabase } from "../lib/supabase";
import "../styles/SellerCoupons.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

const emptyForm = {
  code: "",
  discountType: "percentage",
  discountValue: "",
  minOrder: "",
  maxDiscount: "",
  usageLimit: "",
  startDate: "",
  expiryDate: "",
  active: true,
};

function SellerCoupons() {
  const [coupons, setCoupons] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);

  const [formData, setFormData] =
    useState(emptyForm);

  const [formError, setFormError] = useState("");
  const [pageError, setPageError] = useState("");

  // =========================================================
  // GET AUTH TOKEN
  // =========================================================

  const getAccessToken = async () => {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      throw new Error(
        error.message ||
          "Unable to get authentication session."
      );
    }

    if (!session?.access_token) {
      throw new Error(
        "Please login again."
      );
    }

    return session.access_token;
  };

  // =========================================================
  // FORMAT DATABASE COUPON
  // =========================================================

  const mapCoupon = (coupon) => {
    return {
      id: coupon.id,

      code: coupon.code || "",

      discountType:
        coupon.discount_type || "percentage",

      discountValue:
        Number(coupon.discount_value || 0),

      minOrder:
        Number(
          coupon.minimum_order_amount || 0
        ),

      maxDiscount:
        coupon.maximum_discount === null ||
        coupon.maximum_discount === undefined
          ? 0
          : Number(coupon.maximum_discount),

      usageLimit:
        coupon.usage_limit === null ||
        coupon.usage_limit === undefined
          ? null
          : Number(coupon.usage_limit),

      usedCount:
        Number(coupon.used_count || 0),

      startDate:
        coupon.starts_at
          ? coupon.starts_at.slice(0, 10)
          : "",

      expiryDate:
        coupon.expires_at
          ? coupon.expires_at.slice(0, 10)
          : "",

      active:
        Boolean(coupon.is_active),
    };
  };

  // =========================================================
  // LOAD SELLER COUPONS
  // =========================================================

  const loadCoupons = async () => {
    try {
      setLoading(true);
      setPageError("");

      const token =
        await getAccessToken();

      const response = await fetch(
        `${API_URL}/api/coupons/seller`,
        {
          method: "GET",
          headers: {
            Authorization:
              `Bearer ${token}`,
            "Content-Type":
              "application/json",
          },
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Unable to load coupons."
        );
      }

      const mappedCoupons =
        (result.coupons || []).map(
          mapCoupon
        );

      setCoupons(mappedCoupons);
    } catch (error) {
      console.error(
        "Load coupons error:",
        error
      );

      setPageError(
        error.message ||
          "Unable to load coupons."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadCoupons();
  }, []);

  // =========================================================
  // DATE STATUS
  // =========================================================

  const getCouponStatus = (coupon) => {
    const today = new Date();

    today.setHours(
      0,
      0,
      0,
      0
    );

    const startDate =
      coupon.startDate
        ? new Date(
            `${coupon.startDate}T00:00:00`
          )
        : null;

    const expiryDate =
      coupon.expiryDate
        ? new Date(
            `${coupon.expiryDate}T23:59:59`
          )
        : null;

    if (
      coupon.usageLimit !== null &&
      coupon.usedCount >=
        coupon.usageLimit
    ) {
      return "limit";
    }

    if (
      expiryDate &&
      today > expiryDate
    ) {
      return "expired";
    }

    if (
      startDate &&
      today < startDate
    ) {
      return "scheduled";
    }

    if (!coupon.active) {
      return "inactive";
    }

    return "active";
  };

  // =========================================================
  // FILTER COUPONS
  // =========================================================

  const filteredCoupons = useMemo(() => {
    const query =
      searchQuery
        .trim()
        .toLowerCase();

    return coupons.filter(
      (coupon) => {
        const matchesSearch =
          !query ||
          coupon.code
            .toLowerCase()
            .includes(query);

        const status =
          getCouponStatus(coupon);

        let matchesStatus = true;

        if (
          statusFilter === "active"
        ) {
          matchesStatus =
            status === "active";
        }

        if (
          statusFilter === "inactive"
        ) {
          matchesStatus =
            status === "inactive";
        }

        if (
          statusFilter === "expired"
        ) {
          matchesStatus =
            status === "expired" ||
            status === "limit";
        }

        if (
          statusFilter === "scheduled"
        ) {
          matchesStatus =
            status === "scheduled";
        }

        return (
          matchesSearch &&
          matchesStatus
        );
      }
    );
  }, [
    coupons,
    searchQuery,
    statusFilter,
  ]);

  // =========================================================
  // OPEN ADD MODAL
  // =========================================================

  const openAddModal = () => {
    setEditingCoupon(null);
    setFormData({
      ...emptyForm,
    });
    setFormError("");
    setIsModalOpen(true);
  };

  // =========================================================
  // OPEN EDIT MODAL
  // =========================================================

  const openEditModal = (coupon) => {
    setEditingCoupon(coupon);

    setFormData({
      code: coupon.code,

      discountType:
        coupon.discountType,

      discountValue:
        coupon.discountValue,

      minOrder:
        coupon.minOrder,

      maxDiscount:
        coupon.maxDiscount,

      usageLimit:
        coupon.usageLimit ?? "",

      startDate:
        coupon.startDate,

      expiryDate:
        coupon.expiryDate,

      active:
        coupon.active,
    });

    setFormError("");
    setIsModalOpen(true);
  };

  // =========================================================
  // CLOSE MODAL
  // =========================================================

  const closeModal = () => {
    if (saving) {
      return;
    }

    setIsModalOpen(false);
    setEditingCoupon(null);
    setFormData({
      ...emptyForm,
    });
    setFormError("");
  };

  // =========================================================
  // FORM CHANGE
  // =========================================================

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setFormData((prev) => ({
      ...prev,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    setFormError("");
  };

  // =========================================================
  // VALIDATE FORM
  // =========================================================

  const validateForm = () => {
    const code =
      formData.code
        .trim()
        .toUpperCase();

    if (!code) {
      return (
        "Please enter a coupon code."
      );
    }

    if (
      !/^[A-Z0-9_-]+$/.test(code)
    ) {
      return (
        "Coupon code can contain only letters, numbers, hyphens and underscores."
      );
    }

    const duplicateCoupon =
      coupons.find(
        (coupon) =>
          coupon.code
            .toLowerCase() ===
            code.toLowerCase() &&
          coupon.id !==
            editingCoupon?.id
      );

    if (duplicateCoupon) {
      return (
        "This coupon code already exists."
      );
    }

    if (
      formData.discountValue ===
        "" ||
      Number(
        formData.discountValue
      ) <= 0
    ) {
      return (
        "Please enter a valid discount value."
      );
    }

    if (
      formData.discountType ===
        "percentage" &&
      Number(
        formData.discountValue
      ) > 100
    ) {
      return (
        "Percentage discount cannot be greater than 100%."
      );
    }

    if (
      formData.minOrder ===
        "" ||
      Number(formData.minOrder) < 0
    ) {
      return (
        "Please enter a valid minimum order amount."
      );
    }

    if (
      formData.discountType ===
        "percentage" &&
      (
        formData.maxDiscount ===
          "" ||
        Number(
          formData.maxDiscount
        ) <= 0
      )
    ) {
      return (
        "Please enter the maximum discount."
      );
    }

    if (
      formData.usageLimit ===
        "" ||
      Number(
        formData.usageLimit
      ) <= 0
    ) {
      return (
        "Please enter a valid usage limit."
      );
    }

    if (!formData.startDate) {
      return (
        "Please select a start date."
      );
    }

    if (!formData.expiryDate) {
      return (
        "Please select an expiry date."
      );
    }

    if (
      new Date(
        formData.expiryDate
      ) <
      new Date(
        formData.startDate
      )
    ) {
      return (
        "Expiry date cannot be before the start date."
      );
    }

    return "";
  };

  // =========================================================
  // CREATE / UPDATE COUPON
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    const error =
      validateForm();

    if (error) {
      setFormError(error);
      return;
    }

    try {
      setSaving(true);
      setFormError("");

      const token =
        await getAccessToken();

      const couponData = {
        code:
          formData.code
            .trim()
            .toUpperCase(),

        discount_type:
          formData.discountType,

        discount_value:
          Number(
            formData.discountValue
          ),

        minimum_order_amount:
          Number(
            formData.minOrder
          ),

        maximum_discount:
          formData.discountType ===
          "percentage"
            ? Number(
                formData.maxDiscount
              )
            : null,

        usage_limit:
          Number(
            formData.usageLimit
          ),

        starts_at:
          formData.startDate
            ? `${formData.startDate}T00:00:00`
            : null,

        expires_at:
          formData.expiryDate
            ? `${formData.expiryDate}T23:59:59`
            : null,

        is_active:
          formData.active,
      };

      const url =
        editingCoupon
          ? `${API_URL}/api/coupons/seller/${editingCoupon.id}`
          : `${API_URL}/api/coupons/seller`;

      const method =
        editingCoupon
          ? "PATCH"
          : "POST";

      const response =
        await fetch(url, {
          method,

          headers: {
            Authorization:
              `Bearer ${token}`,

            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify(
              couponData
            ),
        });

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            (
              editingCoupon
                ? "Unable to update coupon."
                : "Unable to create coupon."
            )
        );
      }

      closeModal();

      await loadCoupons();
    } catch (error) {
      console.error(
        "Save coupon error:",
        error
      );

      setFormError(
        error.message ||
          "Unable to save coupon."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // DELETE / DEACTIVATE COUPON
  // =========================================================

  const handleDelete = async (id) => {
    const coupon =
      coupons.find(
        (item) =>
          item.id === id
      );

    if (!coupon) {
      return;
    }

    const confirmed =
      window.confirm(
        `Deactivate coupon "${coupon.code}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      const token =
        await getAccessToken();

      const response =
        await fetch(
          `${API_URL}/api/coupons/seller/${id}`,
          {
            method: "DELETE",

            headers: {
              Authorization:
                `Bearer ${token}`,

              "Content-Type":
                "application/json",
            },
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Unable to deactivate coupon."
        );
      }

      await loadCoupons();
    } catch (error) {
      console.error(
        "Delete coupon error:",
        error
      );

      setPageError(
        error.message ||
          "Unable to deactivate coupon."
      );
    }
  };

  // =========================================================
  // TOGGLE ACTIVE STATUS
  // =========================================================

  const toggleCouponStatus =
    async (coupon) => {
      const currentStatus =
        getCouponStatus(
          coupon
        );

      // Don't allow an expired or
      // usage-limit coupon to be
      // treated as active simply
      // by clicking the status.
      if (
        currentStatus ===
          "expired" ||
        currentStatus ===
          "limit" ||
        currentStatus ===
          "scheduled"
      ) {
        return;
      }

      try {
        const token =
          await getAccessToken();

        const response =
          await fetch(
            `${API_URL}/api/coupons/seller/${coupon.id}`,
            {
              method: "PATCH",

              headers: {
                Authorization:
                  `Bearer ${token}`,

                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                is_active:
                  !coupon.active,
              }),
            }
          );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result.message ||
              "Unable to update coupon status."
          );
        }

        await loadCoupons();
      } catch (error) {
        console.error(
          "Toggle coupon error:",
          error
        );

        setPageError(
          error.message ||
            "Unable to update coupon status."
        );
      }
    };

  // =========================================================
  // FORMAT CURRENCY
  // =========================================================

  const formatCurrency = (
    value
  ) => {
    return `₹${Number(
      value || 0
    ).toLocaleString(
      "en-IN"
    )}`;
  };

  // =========================================================
  // STATUS LABEL
  // =========================================================

  const getStatusLabel = (
    status
  ) => {
    switch (status) {
      case "active":
        return "Active";

      case "inactive":
        return "Inactive";

      case "expired":
        return "Expired";

      case "limit":
        return "Usage Limit";

      case "scheduled":
        return "Scheduled";

      default:
        return "Unknown";
    }
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <main className="seller-coupons-page">
      <div className="seller-coupons-container">

        {/* HEADER */}

        <section className="seller-coupons-header">

          <div>
            <span className="seller-coupons-eyebrow">
              SELLER PANEL
            </span>

            <h1>
              Coupon Codes
            </h1>

            <p>
              Create and manage discount
              coupons for your customers.
            </p>
          </div>

          <button
            type="button"
            className="seller-coupon-add-btn"
            onClick={
              openAddModal
            }
            disabled={loading}
          >
            <Plus size={19} />
            Add Coupon
          </button>

        </section>


        {/* PAGE ERROR */}

        {pageError && (
          <div className="seller-coupon-form-error">
            <XCircle size={17} />

            <span>
              {pageError}
            </span>

            <button
              type="button"
              onClick={() =>
                setPageError("")
              }
              aria-label="Close error"
            >
              <X size={16} />
            </button>
          </div>
        )}


        {/* SUMMARY */}

        <section className="seller-coupon-summary">

          <div className="coupon-summary-card">

            <div className="coupon-summary-icon">
              <TicketPercent
                size={21}
              />
            </div>

            <div>
              <span>
                Total Coupons
              </span>

              <strong>
                {coupons.length}
              </strong>
            </div>

          </div>


          <div className="coupon-summary-card">

            <div className="coupon-summary-icon">
              <CheckCircle
                size={21}
              />
            </div>

            <div>
              <span>
                Active
              </span>

              <strong>
                {
                  coupons.filter(
                    (coupon) =>
                      getCouponStatus(
                        coupon
                      ) === "active"
                  ).length
                }
              </strong>
            </div>

          </div>


          <div className="coupon-summary-card">

            <div className="coupon-summary-icon">
              <XCircle
                size={21}
              />
            </div>

            <div>
              <span>
                Expired
              </span>

              <strong>
                {
                  coupons.filter(
                    (coupon) =>
                      getCouponStatus(
                        coupon
                      ) ===
                        "expired" ||
                      getCouponStatus(
                        coupon
                      ) === "limit"
                  ).length
                }
              </strong>
            </div>

          </div>

        </section>


        {/* FILTER BAR */}

        <section className="seller-coupons-toolbar">

          <div className="coupon-search">

            <Search size={18} />

            <input
              type="search"
              placeholder="Search coupon code..."
              value={
                searchQuery
              }
              onChange={(
                event
              ) =>
                setSearchQuery(
                  event.target
                    .value
                )
              }
            />

          </div>


          <div className="coupon-filter">

            <label htmlFor="couponStatus">
              Status
            </label>

            <select
              id="couponStatus"
              value={
                statusFilter
              }
              onChange={(
                event
              ) =>
                setStatusFilter(
                  event.target
                    .value
                )
              }
            >
              <option value="all">
                All Coupons
              </option>

              <option value="active">
                Active
              </option>

              <option value="inactive">
                Inactive
              </option>

              <option value="scheduled">
                Scheduled
              </option>

              <option value="expired">
                Expired
              </option>
            </select>

          </div>

        </section>


        {/* COUPON TABLE */}

        <section className="seller-coupons-table-card">

          <div className="seller-coupons-table-wrapper">

            <table className="seller-coupons-table">

              <thead>
                <tr>
                  <th>
                    Coupon
                  </th>

                  <th>
                    Discount
                  </th>

                  <th>
                    Minimum Order
                  </th>

                  <th>
                    Usage
                  </th>

                  <th>
                    Validity
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>

                {loading ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="coupon-empty"
                    >
                      <p>
                        Loading coupons...
                      </p>
                    </td>
                  </tr>
                ) : filteredCoupons.length === 0 ? (
                  <tr>

                    <td
                      colSpan="7"
                      className="coupon-empty"
                    >

                      <TicketPercent
                        size={38}
                      />

                      <h3>
                        No coupons found
                      </h3>

                      <p>
                        Try another search
                        or create a new
                        coupon.
                      </p>

                    </td>

                  </tr>
                ) : (
                  filteredCoupons.map(
                    (coupon) => {

                      const status =
                        getCouponStatus(
                          coupon
                        );

                      return (
                        <tr
                          key={
                            coupon.id
                          }
                        >

                          {/* CODE */}

                          <td>

                            <div className="coupon-code-cell">

                              <span className="coupon-code">
                                {
                                  coupon.code
                                }
                              </span>

                              <span className="coupon-code-type">
                                {
                                  coupon.discountType ===
                                  "percentage"
                                    ? "Percentage discount"
                                    : "Fixed discount"
                                }
                              </span>

                            </div>

                          </td>


                          {/* DISCOUNT */}

                          <td>

                            <strong className="coupon-discount">

                              {
                                coupon.discountType ===
                                "percentage"
                                  ? `${coupon.discountValue}%`
                                  : formatCurrency(
                                      coupon.discountValue
                                    )
                              }

                            </strong>

                            {
                              coupon.discountType ===
                                "percentage" &&
                              coupon.maxDiscount >
                                0 && (
                                <span className="coupon-max-discount">
                                  Up to{" "}
                                  {
                                    formatCurrency(
                                      coupon.maxDiscount
                                    )
                                  }
                                </span>
                              )
                            }

                          </td>


                          {/* MINIMUM ORDER */}

                          <td>

                            <div className="coupon-info-item">

                              <IndianRupee
                                size={15}
                              />

                              <span>
                                {
                                  formatCurrency(
                                    coupon.minOrder
                                  )
                                }
                              </span>

                            </div>

                          </td>


                          {/* USAGE */}

                          <td>

                            <div className="coupon-usage">

                              <div className="coupon-usage-text">

                                <Users
                                  size={15}
                                />

                                <span>
                                  {
                                    coupon.usedCount
                                  }
                                  /
                                  {
                                    coupon.usageLimit ===
                                    null
                                      ? "∞"
                                      : coupon.usageLimit
                                  }
                                </span>

                              </div>

                              <div className="coupon-progress">

                                <span
                                  style={{
                                    width:
                                      coupon.usageLimit
                                        ? `${Math.min(
                                            100,
                                            (coupon.usedCount /
                                              coupon.usageLimit) *
                                              100
                                          )}%`
                                        : "0%",
                                  }}
                                />

                              </div>

                            </div>

                          </td>


                          {/* VALIDITY */}

                          <td>

                            <div className="coupon-validity">

                              <div>
                                <CalendarDays
                                  size={14}
                                />

                                <span>
                                  {
                                    coupon.startDate ||
                                    "-"
                                  }
                                </span>
                              </div>

                              <span className="coupon-date-arrow">
                                →
                              </span>

                              <div>
                                <span>
                                  {
                                    coupon.expiryDate ||
                                    "-"
                                  }
                                </span>
                              </div>

                            </div>

                          </td>


                          {/* STATUS */}

                          <td>

                            <button
                              type="button"
                              className={`coupon-status coupon-status-${status}`}
                              onClick={() =>
                                toggleCouponStatus(
                                  coupon
                                )
                              }
                              title={
                                status ===
                                  "active" ||
                                status ===
                                  "inactive"
                                  ? "Click to activate/deactivate"
                                  : "Status cannot be changed while scheduled, expired, or usage limit is reached"
                              }
                              disabled={
                                status ===
                                  "expired" ||
                                status ===
                                  "limit" ||
                                status ===
                                  "scheduled"
                              }
                            >

                              {status ===
                                "active" && (
                                <CheckCircle
                                  size={14}
                                />
                              )}

                              {status ===
                                "inactive" && (
                                <XCircle
                                  size={14}
                                />
                              )}

                              {status ===
                                "expired" && (
                                <XCircle
                                  size={14}
                                />
                              )}

                              {status ===
                                "limit" && (
                                <XCircle
                                  size={14}
                                />
                              )}

                              {status ===
                                "scheduled" && (
                                <CalendarDays
                                  size={14}
                                />
                              )}

                              {
                                getStatusLabel(
                                  status
                                )
                              }

                            </button>

                          </td>


                          {/* ACTIONS */}

                          <td>

                            <div className="coupon-actions">

                              <button
                                type="button"
                                className="coupon-action-btn edit"
                                onClick={() =>
                                  openEditModal(
                                    coupon
                                  )
                                }
                                aria-label={`Edit ${coupon.code}`}
                                disabled={
                                  saving
                                }
                              >
                                <Edit
                                  size={17}
                                />
                              </button>

                              <button
                                type="button"
                                className="coupon-action-btn delete"
                                onClick={() =>
                                  handleDelete(
                                    coupon.id
                                  )
                                }
                                aria-label={`Deactivate ${coupon.code}`}
                                disabled={
                                  saving
                                }
                              >
                                <Trash2
                                  size={17}
                                />
                              </button>

                            </div>

                          </td>

                        </tr>
                      );
                    }
                  )
                )}

              </tbody>

            </table>

          </div>

        </section>

      </div>


      {/* ADD / EDIT MODAL */}

      {isModalOpen && (
        <div
          className="seller-coupon-modal-overlay"
          onMouseDown={(
            event
          ) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }
          }}
        >

          <div className="seller-coupon-modal">

            {/* MODAL HEADER */}

            <div className="seller-coupon-modal-header">

              <div>

                <span className="seller-coupons-eyebrow">
                  {
                    editingCoupon
                      ? "UPDATE COUPON"
                      : "NEW COUPON"
                  }
                </span>

                <h2>
                  {
                    editingCoupon
                      ? "Edit Coupon"
                      : "Add Coupon"
                  }
                </h2>

              </div>

              <button
                type="button"
                className="seller-coupon-modal-close"
                onClick={
                  closeModal
                }
                aria-label="Close"
                disabled={
                  saving
                }
              >
                <X size={21} />
              </button>

            </div>


            {/* FORM */}

            <form
              className="seller-coupon-form"
              onSubmit={
                handleSubmit
              }
            >

              {/* COUPON CODE */}

              <div className="seller-coupon-form-group">

                <label htmlFor="couponCode">
                  Coupon Code
                </label>

                <input
                  id="couponCode"
                  name="code"
                  type="text"
                  value={
                    formData.code
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="e.g. BEE10"
                  maxLength="30"
                  autoComplete="off"
                  disabled={
                    saving
                  }
                />

                <small>
                  Customers will enter
                  this code during
                  checkout.
                </small>

              </div>


              {/* DISCOUNT */}

              <div className="seller-coupon-form-row">

                <div className="seller-coupon-form-group">

                  <label htmlFor="discountType">
                    Discount Type
                  </label>

                  <select
                    id="discountType"
                    name="discountType"
                    value={
                      formData.discountType
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      saving
                    }
                  >
                    <option value="percentage">
                      Percentage
                    </option>

                    <option value="fixed">
                      Fixed Amount
                    </option>
                  </select>

                </div>


                <div className="seller-coupon-form-group">

                  <label htmlFor="discountValue">
                    Discount Value
                  </label>

                  <div className="seller-input-with-prefix">

                    <span>
                      {
                        formData.discountType ===
                        "percentage"
                          ? "%"
                          : "₹"
                      }
                    </span>

                    <input
                      id="discountValue"
                      name="discountValue"
                      type="number"
                      min="0"
                      step="0.01"
                      value={
                        formData.discountValue
                      }
                      onChange={
                        handleChange
                      }
                      placeholder={
                        formData.discountType ===
                        "percentage"
                          ? "10"
                          : "100"
                      }
                      disabled={
                        saving
                      }
                    />

                  </div>

                </div>

              </div>


              {/* ORDER AMOUNT */}

              <div className="seller-coupon-form-row">

                <div className="seller-coupon-form-group">

                  <label htmlFor="minOrder">
                    Minimum Order Amount
                  </label>

                  <div className="seller-input-with-prefix">

                    <span>
                      ₹
                    </span>

                    <input
                      id="minOrder"
                      name="minOrder"
                      type="number"
                      min="0"
                      step="1"
                      value={
                        formData.minOrder
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="500"
                      disabled={
                        saving
                      }
                    />

                  </div>

                </div>


                {
                  formData.discountType ===
                    "percentage" && (
                    <div className="seller-coupon-form-group">

                      <label htmlFor="maxDiscount">
                        Maximum Discount
                      </label>

                      <div className="seller-input-with-prefix">

                        <span>
                          ₹
                        </span>

                        <input
                          id="maxDiscount"
                          name="maxDiscount"
                          type="number"
                          min="0"
                          step="1"
                          value={
                            formData.maxDiscount
                          }
                          onChange={
                            handleChange
                          }
                          placeholder="200"
                          disabled={
                            saving
                          }
                        />

                      </div>

                    </div>
                  )
                }

              </div>


              {/* USAGE */}

              <div className="seller-coupon-form-group">

                <label htmlFor="usageLimit">
                  Usage Limit
                </label>

                <input
                  id="usageLimit"
                  name="usageLimit"
                  type="number"
                  min="1"
                  step="1"
                  value={
                    formData.usageLimit
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="100"
                  disabled={
                    saving
                  }
                />

                <small>
                  Maximum number of times
                  this coupon can be used.
                </small>

              </div>


              {/* DATES */}

              <div className="seller-coupon-form-row">

                <div className="seller-coupon-form-group">

                  <label htmlFor="startDate">
                    Start Date
                  </label>

                  <input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={
                      formData.startDate
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      saving
                    }
                  />

                </div>


                <div className="seller-coupon-form-group">

                  <label htmlFor="expiryDate">
                    Expiry Date
                  </label>

                  <input
                    id="expiryDate"
                    name="expiryDate"
                    type="date"
                    value={
                      formData.expiryDate
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      saving
                    }
                  />

                </div>

              </div>


              {/* ACTIVE */}

              <label className="seller-coupon-toggle">

                <input
                  type="checkbox"
                  name="active"
                  checked={
                    formData.active
                  }
                  onChange={
                    handleChange
                  }
                  disabled={
                    saving
                  }
                />

                <span className="seller-coupon-toggle-track">
                  <span />
                </span>

                <div>

                  <strong>
                    Coupon Active
                  </strong>

                  <small>
                    Customers can use
                    this coupon when
                    it is active.
                  </small>

                </div>

              </label>


              {/* ERROR */}

              {formError && (
                <div className="seller-coupon-form-error">

                  <XCircle
                    size={17}
                  />

                  <span>
                    {formError}
                  </span>

                </div>
              )}


              {/* BUTTONS */}

              <div className="seller-coupon-form-actions">

                <button
                  type="button"
                  className="seller-coupon-cancel-btn"
                  onClick={
                    closeModal
                  }
                  disabled={
                    saving
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="seller-coupon-save-btn"
                  disabled={
                    saving
                  }
                >
                  {
                    saving
                      ? "Saving..."
                      : editingCoupon
                        ? "Update Coupon"
                        : "Save Coupon"
                  }
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </main>
  );
}

export default SellerCoupons;