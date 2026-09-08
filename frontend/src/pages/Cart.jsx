import { useEffect, useState } from "react";

import {
  Minus,
  Plus,
  Trash2,
  ArrowLeft,
  ShoppingBag,
} from "lucide-react";

import {
  getCart,
  removeFromCart,
  updateCartQuantity,
  getCartTotal,
} from "../utils/cart";

import { validateCoupon } from "../utils/coupon";

import { Link } from "react-router-dom";

import "../styles/Cart.css";


function Cart() {

  // =========================================
  // CART STATE
  // =========================================

  const [cart, setCart] = useState([]);


  // =========================================
  // COUPON STATE
  // =========================================

  const [couponCode, setCouponCode] = useState("");

  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const [couponError, setCouponError] = useState("");


  // =========================================
  // LOAD CART
  // =========================================

  const loadCart = () => {
    setCart(getCart());
  };


  useEffect(() => {

    loadCart();

    const handleCartUpdate = () => {
      loadCart();
    };

    window.addEventListener(
      "cartUpdated",
      handleCartUpdate
    );

    return () => {
      window.removeEventListener(
        "cartUpdated",
        handleCartUpdate
      );
    };

  }, []);


  // =========================================
  // REMOVE PRODUCT
  // =========================================

  const handleRemove = (productId) => {

    const updatedCart =
      removeFromCart(productId);

    setCart(updatedCart);

  };


  // =========================================
  // DECREASE QUANTITY
  // =========================================

  const handleDecrease = (product) => {

    if (product.quantity <= 1) {

      handleRemove(product.id);

      return;
    }

    const updatedCart =
      updateCartQuantity(
        product.id,
        product.quantity - 1
      );

    setCart(updatedCart);

  };


  // =========================================
  // INCREASE QUANTITY
  // =========================================

  const handleIncrease = (product) => {

    const updatedCart =
      updateCartQuantity(
        product.id,
        product.quantity + 1
      );

    setCart(updatedCart);

  };


  // =========================================
  // APPLY COUPON
  // =========================================

  const handleApplyCoupon = () => {

    setCouponError("");

    const subtotal = getCartTotal();

    const result = validateCoupon(
      couponCode,
      subtotal
    );


    if (!result.valid) {

      setAppliedCoupon(null);

      setCouponError(result.message);

      return;
    }


    setAppliedCoupon(result.coupon);

    setCouponCode(result.coupon.code);

    setCouponError("");

  };


  // =========================================
  // REMOVE COUPON
  // =========================================

  const handleRemoveCoupon = () => {

    setAppliedCoupon(null);

    setCouponCode("");

    setCouponError("");

  };


  // =========================================
  // TOTALS
  // =========================================

  const subtotal = getCartTotal();

  const shipping =
    subtotal >= 999
      ? 0
      : 60;


  const discount =
    appliedCoupon
      ? appliedCoupon.discount
      : 0;


  const total = Math.max(
    0,
    subtotal + shipping - discount
  );


  // =========================================
  // EMPTY CART
  // =========================================

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
            Looks like you haven't added anything
            to your cart yet. Discover our naturally
            good products.
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


  // =========================================
  // CART PAGE
  // =========================================

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
              Review your naturally good products
              before checkout.
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



        {/* =====================================
            CART LAYOUT
        ===================================== */}

        <div className="cart-layout">


          {/* ===================================
              CART ITEMS
          =================================== */}

          <div className="cart-items">

            {cart.map((product) => (

              <article
                className="cart-item"
                key={product.id}
              >


                {/* IMAGE */}

                <Link
                  to={`/product/${product.id}`}
                  className="cart-item-image"
                >

                  <img
                    src={product.image}
                    alt={product.name}
                  />

                </Link>



                {/* DETAILS */}

                <div className="cart-item-details">

                  <span className="cart-item-category">
                    {product.category}
                  </span>


                  <h2>
                    {product.name}
                  </h2>


                  <strong>
                    ₹{product.price}
                  </strong>



                  {/* ACTIONS */}

                  <div className="cart-item-actions">


                    {/* QUANTITY */}

                    <div className="cart-quantity">

                      <button
                        type="button"
                        onClick={() =>
                          handleDecrease(product)
                        }
                        aria-label="Decrease quantity"
                      >

                        <Minus size={14} />

                      </button>


                      <span>
                        {product.quantity}
                      </span>


                      <button
                        type="button"
                        onClick={() =>
                          handleIncrease(product)
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
                        handleRemove(product.id)
                      }
                    >

                      <Trash2 size={14} />

                      Remove

                    </button>

                  </div>

                </div>



                {/* ITEM TOTAL */}

                <div className="cart-item-total">

                  ₹
                  {(
                    product.price *
                    product.quantity
                  ).toLocaleString("en-IN")}

                </div>

              </article>

            ))}

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
                ₹{subtotal.toLocaleString("en-IN")}
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
                COUPON SECTION
            ================================= */}

            <div className="cart-coupon">

              <p className="cart-coupon-title">
                Coupon Code
              </p>


              {!appliedCoupon && (

                <div className="cart-coupon-form">

                  <input
                    type="text"
                    value={couponCode}
                    onChange={(event) => {

                      setCouponCode(
                        event.target.value
                      );

                      setCouponError("");

                    }}
                    onKeyDown={(event) => {

                      if (event.key === "Enter") {
                        handleApplyCoupon();
                      }

                    }}
                    placeholder="Enter coupon code"
                    aria-label="Coupon code"
                  />


                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                  >
                    Apply
                  </button>

                </div>

              )}



              {/* ERROR */}

              {couponError && (

                <p className="cart-coupon-error">
                  {couponError}
                </p>

              )}



              {/* APPLIED COUPON */}

              {appliedCoupon && (

                <div className="cart-coupon-applied">

                  <span>
                    ✓ {appliedCoupon.code} applied
                  </span>


                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                  >
                    Remove
                  </button>

                </div>

              )}

            </div>



            {/* =================================
                DISCOUNT
            ================================= */}

            {appliedCoupon && (

              <div className="cart-summary-row cart-discount-row">

                <span>
                  Discount
                </span>

                <strong>
                  -₹
                  {discount.toLocaleString(
                    "en-IN",
                    {
                      maximumFractionDigits: 2,
                    }
                  )}
                </strong>

              </div>

            )}



            {/* FREE SHIPPING MESSAGE */}

            {subtotal < 999 && (

              <p className="cart-shipping-note">

                Add ₹
                {(999 - subtotal).toLocaleString(
                  "en-IN"
                )}
                {" "}
                more for free shipping.

              </p>

            )}



            {/* =================================
                TOTAL
            ================================= */}

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