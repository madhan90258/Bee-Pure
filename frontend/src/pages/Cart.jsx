import { useEffect, useState } from "react";

import {
  Minus,
  Plus,
  Trash2,
  ArrowLeft,
  ShoppingBag,
  Loader2,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { supabase } from "../lib/supabase";

import "../styles/Cart.css";


const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";


/* =========================================
   SUPABASE STORAGE IMAGE URL
========================================= */

const getProductImageUrl = (
  storagePath
) => {
  if (!storagePath) {
    return "";
  }

  if (
    storagePath.startsWith("http://") ||
    storagePath.startsWith("https://")
  ) {
    return storagePath;
  }

  const { data } =
    supabase.storage
      .from("product-images")
      .getPublicUrl(storagePath);

  return data?.publicUrl || "";
};


/* =========================================
   MAP BACKEND CART
========================================= */

const mapCartItem = (item) => {
  const product = item.products;

  if (!product) {
    return null;
  }

  const primaryImage =
    product.product_images?.find(
      (image) =>
        image.is_primary
    ) ||
    product.product_images?.[0];

  return {
    cartItemId: item.id,

    id: product.id,

    productId: product.id,

    name: product.name,

    category:
      product.categories?.name ||
      "",

    price:
      Number(product.price) || 0,

    oldPrice:
      product.old_price != null
        ? Number(product.old_price)
        : null,

    quantity:
      Number(item.quantity) || 1,

    stockQuantity:
      Number(product.stock_quantity) ||
      0,

    rating:
      Number(product.rating) || 0,

    image:
      getProductImageUrl(
        primaryImage?.storage_path
      ),

    slug:
      product.slug || "",

    farmer:
      product.farmers?.name || "",
  };
};


/* =========================================
   CART
========================================= */

function Cart() {
  const navigate = useNavigate();

  const [cart, setCart] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [updatingId, setUpdatingId] =
    useState(null);

  const [removingId, setRemovingId] =
    useState(null);


  /* =========================================
     COUPON STATE
  ========================================== */

  const [couponCode, setCouponCode] =
    useState("");

  const [appliedCoupon, setAppliedCoupon] =
    useState(null);

  const [couponDiscount, setCouponDiscount] =
    useState(0);

  const [couponError, setCouponError] =
    useState("");

  const [couponLoading, setCouponLoading] =
    useState(false);


  /* =========================================
     GET ACCESS TOKEN
  ========================================== */

  const getAccessToken =
    async () => {
      const {
        data,
        error,
      } =
        await supabase.auth.getSession();

      if (error) {
        throw new Error(
          "Unable to verify your login."
        );
      }

      const token =
        data?.session?.access_token;

      if (!token) {
        navigate("/login");

        throw new Error(
          "Please login to view your cart."
        );
      }

      return token;
    };


  /* =========================================
     LOAD CART
  ========================================== */

  const loadCart = async () => {
    try {
      setLoading(true);
      setError("");

      const token =
        await getAccessToken();

      const response =
        await fetch(
          `${API_URL}/api/cart`,
          {
            method: "GET",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "Unable to load cart."
        );
      }

      const mappedCart =
        (result.cart || [])
          .map(mapCartItem)
          .filter(Boolean);

      setCart(mappedCart);

      window.dispatchEvent(
        new Event(
          "beePureCartUpdated"
        )
      );

      window.dispatchEvent(
        new Event(
          "cartUpdated"
        )
      );

    } catch (err) {
      console.error(
        "Load cart error:",
        err
      );

      if (
        err.message?.toLowerCase()
          .includes("login")
      ) {
        setCart([]);
      } else {
        setError(
          err.message ||
            "Unable to load your cart."
        );
      }

    } finally {
      setLoading(false);
    }
  };


  /* =========================================
     INITIAL LOAD
  ========================================== */

  useEffect(() => {
    loadCart();
  }, []);


  /* =========================================
     CALCULATE SUBTOTAL
  ========================================== */

  const subtotal =
    cart.reduce(
      (total, product) =>
        total +
        product.price *
          product.quantity,
      0
    );


  /* =========================================
     SHIPPING
  ========================================== */

  const shipping =
    subtotal >= 999
      ? 0
      : 50;


  /* =========================================
     TOTAL
  ========================================== */

  const total =
    Math.max(
      0,
      subtotal +
        shipping -
        couponDiscount
    );


  /* =========================================
     UPDATE CART QUANTITY
  ========================================== */

  const updateQuantity = async (
    productId,
    quantity
  ) => {
    try {
      setUpdatingId(productId);
      setError("");

      const token =
        await getAccessToken();

      const response =
        await fetch(
          `${API_URL}/api/cart/${encodeURIComponent(
            productId
          )}`,
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              quantity,
            }),
          }
        );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "Unable to update cart."
        );
      }

      await loadCart();

    } catch (err) {
      console.error(
        "Update cart error:",
        err
      );

      setError(
        err.message ||
          "Unable to update cart."
      );

    } finally {
      setUpdatingId(null);
    }
  };


  /* =========================================
     DECREASE
  ========================================== */

  const handleDecrease = (
    product
  ) => {
    if (
      product.quantity <= 1
    ) {
      handleRemove(
        product.productId
      );

      return;
    }

    updateQuantity(
      product.productId,
      product.quantity - 1
    );
  };


  /* =========================================
     INCREASE
  ========================================== */

  const handleIncrease = (
    product
  ) => {
    if (
      product.quantity >=
      product.stockQuantity
    ) {
      setError(
        `Only ${product.stockQuantity} units of ${product.name} are available.`
      );

      return;
    }

    updateQuantity(
      product.productId,
      product.quantity + 1
    );
  };


  /* =========================================
     REMOVE PRODUCT
  ========================================== */

  const handleRemove = async (
    productId
  ) => {
    try {
      setRemovingId(productId);
      setError("");

      const token =
        await getAccessToken();

      const response =
        await fetch(
          `${API_URL}/api/cart/${encodeURIComponent(
            productId
          )}`,
          {
            method: "DELETE",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "Unable to remove product."
        );
      }

      setCart(
        (current) =>
          current.filter(
            (product) =>
              String(
                product.productId
              ) !==
              String(productId)
          )
      );

      setAppliedCoupon(null);
      setCouponDiscount(0);
      setCouponCode("");
      setCouponError("");

      window.dispatchEvent(
        new Event(
          "beePureCartUpdated"
        )
      );

      window.dispatchEvent(
        new Event(
          "cartUpdated"
        )
      );

    } catch (err) {
      console.error(
        "Remove cart error:",
        err
      );

      setError(
        err.message ||
          "Unable to remove product."
      );

    } finally {
      setRemovingId(null);
    }
  };


  /* =========================================
     APPLY COUPON
  ========================================== */

  const handleApplyCoupon =
    async () => {
      if (!couponCode.trim()) {
        setCouponError(
          "Please enter a coupon code."
        );

        return;
      }

      if (subtotal <= 0) {
        setCouponError(
          "Add products before applying a coupon."
        );

        return;
      }

      try {
        setCouponLoading(true);
        setCouponError("");

        const response =
          await fetch(
            `${API_URL}/api/coupons/validate`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                code:
                  couponCode.trim(),

                subtotal,
              }),
            }
          );

        const result =
          await response.json();

        if (
          !response.ok ||
          !result.success
        ) {
          throw new Error(
            result.message ||
              "Invalid coupon."
          );
        }

        setAppliedCoupon(
          result.coupon
        );

        setCouponDiscount(
          Number(
            result.discount
          ) || 0
        );

        setCouponCode(
          result.coupon.code
        );

      } catch (err) {
        console.error(
          "Coupon validation error:",
          err
        );

        setAppliedCoupon(null);
        setCouponDiscount(0);

        setCouponError(
          err.message ||
            "Unable to validate coupon."
        );

      } finally {
        setCouponLoading(false);
      }
    };


  /* =========================================
     REMOVE COUPON
  ========================================== */

  const handleRemoveCoupon =
    () => {
      setAppliedCoupon(null);
      setCouponDiscount(0);
      setCouponCode("");
      setCouponError("");
    };


  /* =========================================
     LOADING
  ========================================== */

  if (loading) {
    return (
      <main className="cart-page">

        <div className="cart-empty">

          <div className="cart-empty-icon">

            <Loader2
              size={34}
              className="cart-spinner"
            />

          </div>

          <h1>
            Loading Your Cart...
          </h1>

          <p>
            Please wait while we load
            your products.
          </p>

        </div>

      </main>
    );
  }


  /* =========================================
     ERROR
  ========================================== */

  if (
    error &&
    cart.length === 0
  ) {
    return (
      <main className="cart-page">

        <div className="cart-empty">

          <div className="cart-empty-icon">
            <ShoppingBag size={34} />
          </div>

          <h1>
            Unable to Load Cart
          </h1>

          <p>
            {error}
          </p>

          <button
            type="button"
            className="cart-shop-button"
            onClick={loadCart}
          >
            Try Again
          </button>

        </div>

      </main>
    );
  }


  /* =========================================
     EMPTY CART
  ========================================== */

  if (cart.length === 0) {
    return (
      <main className="cart-page">

        <div className="cart-empty">

          <div className="cart-empty-icon">

            <ShoppingBag size={34} />

          </div>

          <h1>
            Your Cart is Empty
          </h1>

          <p>
            Looks like you haven't added
            anything to your cart yet.
            Discover our naturally good
            products.
          </p>

          <Link
            to="/shop"
            className="cart-shop-button"
          >
            Explore Products
          </Link>

        </div>

      </main>
    );
  }


  /* =========================================
     CART PAGE
  ========================================== */

  return (
    <main className="cart-page">

      <div className="cart-container">

        {/* =====================================
            HEADER
        ===================================== */}

        <div className="cart-header">

          <div>

            <p className="cart-eyebrow">
              YOUR BEE PURE CART
            </p>

            <h1>
              Your Shopping Cart
            </h1>

            <p>
              Review your naturally good
              products before checkout.
            </p>

          </div>


          <Link
            to="/shop"
            className="cart-continue"
          >

            <ArrowLeft size={16} />

            Continue Shopping

          </Link>

        </div>


        {/* ERROR */}

        {error && (
          <div className="cart-page-error">
            {error}
          </div>
        )}


        {/* =====================================
            CART LAYOUT
        ===================================== */}

        <div className="cart-layout">


          {/* ===================================
              CART ITEMS
          =================================== */}

          <div className="cart-items">

            {cart.map(
              (product) => {

                const isUpdating =
                  updatingId ===
                  product.productId;

                const isRemoving =
                  removingId ===
                  product.productId;

                return (
                  <article
                    className="cart-item"
                    key={
                      product.cartItemId
                    }
                  >

                    {/* IMAGE */}

                    <Link
                      to={`/product/${product.productId}`}
                      className="cart-item-image"
                    >

                      <img
                        src={
                          product.image
                        }
                        alt={
                          product.name
                        }
                      />

                    </Link>


                    {/* DETAILS */}

                    <div className="cart-item-details">

                      <span className="cart-item-category">
                        {
                          product.category
                        }
                      </span>


                      <h2>
                        {
                          product.name
                        }
                      </h2>


                      <strong>
                        ₹
                        {
                          product.price
                        }
                      </strong>


                      {/* ACTIONS */}

                      <div className="cart-item-actions">


                        {/* QUANTITY */}

                        <div className="cart-quantity">

                          <button
                            type="button"
                            onClick={() =>
                              handleDecrease(
                                product
                              )
                            }
                            disabled={
                              isUpdating ||
                              isRemoving
                            }
                            aria-label="Decrease quantity"
                          >

                            <Minus size={14} />

                          </button>


                          <span>
                            {
                              isUpdating
                                ? "..."
                                : product.quantity
                            }
                          </span>


                          <button
                            type="button"
                            onClick={() =>
                              handleIncrease(
                                product
                              )
                            }
                            disabled={
                              isUpdating ||
                              isRemoving ||
                              product.quantity >=
                                product.stockQuantity
                            }
                            aria-label="Increase quantity"
                          >

                            <Plus size={14} />

                          </button>

                        </div>


                        {/* REMOVE */}

                        <button
                          type="button"
                          className="cart-remove"
                          onClick={() =>
                            handleRemove(
                              product.productId
                            )
                          }
                          disabled={
                            isRemoving ||
                            isUpdating
                          }
                        >

                          {isRemoving ? (
                            <Loader2
                              size={14}
                              className="cart-spinner"
                            />
                          ) : (
                            <Trash2
                              size={14}
                            />
                          )}

                          {isRemoving
                            ? "Removing..."
                            : "Remove"}

                        </button>

                      </div>

                    </div>


                    {/* ITEM TOTAL */}

                    <div className="cart-item-total">

                      ₹
                      {(
                        product.price *
                        product.quantity
                      ).toLocaleString(
                        "en-IN"
                      )}

                    </div>

                  </article>
                );
              }
            )}

          </div>


          {/* ===================================
              ORDER SUMMARY
          =================================== */}

          <aside className="cart-summary">

            <h2>
              Order Summary
            </h2>


            {/* SUBTOTAL */}

            <div className="cart-summary-row">

              <span>
                Subtotal
              </span>

              <strong>
                ₹
                {subtotal.toLocaleString(
                  "en-IN"
                )}
              </strong>

            </div>


            {/* SHIPPING */}

            <div className="cart-summary-row">

              <span>
                Shipping
              </span>

              {shipping === 0 ? (

                <span className="cart-free">
                  FREE
                </span>

              ) : (

                <strong>
                  ₹{shipping}
                </strong>

              )}

            </div>


            {/* =================================
                COUPON
            ================================= */}

            <div className="cart-coupon">

              <p className="cart-coupon-title">
                Coupon Code
              </p>


              {!appliedCoupon && (

                <div className="cart-coupon-form">

                  <input
                    type="text"
                    value={
                      couponCode
                    }
                    onChange={(
                      event
                    ) => {

                      setCouponCode(
                        event.target.value
                      );

                      setCouponError("");

                    }}
                    onKeyDown={(
                      event
                    ) => {

                      if (
                        event.key ===
                        "Enter"
                      ) {
                        handleApplyCoupon();
                      }

                    }}
                    placeholder="Enter coupon code"
                    aria-label="Coupon code"
                    disabled={
                      couponLoading
                    }
                  />


                  <button
                    type="button"
                    onClick={
                      handleApplyCoupon
                    }
                    disabled={
                      couponLoading
                    }
                  >

                    {couponLoading
                      ? "..."
                      : "Apply"}

                  </button>

                </div>

              )}


              {/* ERROR */}

              {couponError && (

                <p className="cart-coupon-error">
                  {
                    couponError
                  }
                </p>

              )}


              {/* APPLIED */}

              {appliedCoupon && (

                <div className="cart-coupon-applied">

                  <span>
                    ✓{" "}
                    {
                      appliedCoupon.code
                    }{" "}
                    applied
                  </span>

                  <button
                    type="button"
                    onClick={
                      handleRemoveCoupon
                    }
                  >
                    Remove
                  </button>

                </div>

              )}

            </div>


            {/* =================================
                DISCOUNT
            ================================= */}

            {couponDiscount >
              0 && (

              <div className="cart-summary-row cart-discount-row">

                <span>
                  Discount
                </span>

                <strong>
                  -₹
                  {couponDiscount.toLocaleString(
                    "en-IN",
                    {
                      maximumFractionDigits: 2,
                    }
                  )}
                </strong>

              </div>

            )}


            {/* FREE SHIPPING */}

            {subtotal < 999 && (

              <p className="cart-shipping-note">

                Add ₹
                {(
                  999 - subtotal
                ).toLocaleString(
                  "en-IN"
                )}
                {" "}
                more for free shipping.

              </p>

            )}


            {/* TOTAL */}

            <div className="cart-summary-total">

              <span>
                Total
              </span>

              <strong>
                ₹
                {total.toLocaleString(
                  "en-IN",
                  {
                    maximumFractionDigits: 2,
                  }
                )}
              </strong>

            </div>


            {/* CHECKOUT */}

            <Link
              to="/checkout"
              className="cart-checkout-button"
            >
              Proceed to Checkout
            </Link>


            {/* NOTE */}

            <p className="cart-summary-note">

              Secure checkout • Freshly packed •
              Direct from farmers

            </p>

          </aside>

        </div>

      </div>

    </main>
  );
}


export default Cart;