import { useEffect, useState } from "react";
import {
  MapPin,
  Navigation,
  User,
  Phone,
  Mail,
  Home,
  ShoppingBag,
  ArrowLeft,
  Lock,
} from "lucide-react";

import { Link } from "react-router-dom";

import {
  getCart,
  getCartTotal,
} from "../utils/cart";

import "../styles/Checkout.css";

function Checkout() {
  const [cart, setCart] = useState([]);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [locationLoading, setLocationLoading] = useState(false);
  const [locationMessage, setLocationMessage] = useState("");

  // =========================================
  // LOAD CART
  // =========================================

  useEffect(() => {
    setCart(getCart());
  }, []);

  // =========================================
  // HANDLE INPUT
  // =========================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // =========================================
  // USE LIVE LOCATION
  // =========================================

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage(
        "Live location is not supported by your browser."
      );
      return;
    }

    setLocationLoading(true);
    setLocationMessage("Getting your location...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          /*
           * Reverse geocoding using OpenStreetMap.
           *
           * This is only for getting the readable
           * address from the user's coordinates.
           */

          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
          );

          const data = await response.json();

          const address = data.address || {};

          setFormData((current) => ({
            ...current,

            address:
              data.display_name ||
              current.address,

            city:
              address.city ||
              address.town ||
              address.village ||
              current.city,

            state:
              address.state ||
              current.state,

            pincode:
              address.postcode ||
              current.pincode,
          }));

          setLocationMessage(
            "Location added successfully."
          );
        } catch (error) {
          console.error(
            "Location address error:",
            error
          );

          setLocationMessage(
            "Location found, but we couldn't get the address. Please enter it manually."
          );
        } finally {
          setLocationLoading(false);
        }
      },

      (error) => {
        console.error(
          "Geolocation error:",
          error
        );

        setLocationLoading(false);

        setLocationMessage(
          "Unable to access your location. Please allow location permission or enter your address manually."
        );
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // =========================================
  // ORDER TOTALS
  // =========================================

  const subtotal = getCartTotal();

  const shipping =
    subtotal >= 999 ? 0 : 60;

  /*
   * Coupon support is intentionally kept ready.
   *
   * If your cart already stores the applied coupon,
   * replace this value with your existing coupon
   * calculation.
   */

  const couponDiscount = 0;

  const total =
    subtotal +
    shipping -
    couponDiscount;

  // =========================================
  // PLACE ORDER
  // =========================================

  const handlePlaceOrder = (event) => {
    event.preventDefault();

    if (cart.length === 0) {
      return;
    }

    console.log(
      "Customer details:",
      formData
    );

    console.log(
      "Order:",
      cart
    );

    console.log(
      "Total:",
      total
    );

    /*
     * Razorpay will be connected here later.
     */

    alert(
      "Order details saved. Payment gateway will be connected next."
    );
  };

  // =========================================
  // EMPTY CART
  // =========================================

  if (cart.length === 0) {
    return (
      <main className="checkout-page">
        <div className="checkout-empty">

          <ShoppingBag size={40} />

          <h1>
            Your Cart is Empty
          </h1>

          <p>
            Add some products before
            proceeding to checkout.
          </p>

          <Link to="/shop">
            Explore Products
          </Link>

        </div>
      </main>
    );
  }

  // =========================================
  // CHECKOUT
  // =========================================

  return (
    <main className="checkout-page">

      <div className="checkout-container">

        {/* =====================================
            HEADER
        ===================================== */}

        <div className="checkout-header">

          <div>

            <p className="checkout-eyebrow">
              BEE PURE CHECKOUT
            </p>

            <h1>
              Complete Your Order
            </h1>

            <p>
              Enter your delivery details
              and review your order.
            </p>

          </div>

          <Link
            to="/cart"
            className="checkout-back"
          >
            <ArrowLeft size={16} />
            Back to Cart
          </Link>

        </div>


        {/* =====================================
            MAIN CHECKOUT
        ===================================== */}

        <form
          className="checkout-layout"
          onSubmit={handlePlaceOrder}
        >

          {/* ===================================
              CUSTOMER DETAILS
          =================================== */}

          <section className="checkout-card">

            <div className="checkout-card-header">

              <div className="checkout-card-icon">
                <User size={18} />
              </div>

              <div>

                <h2>
                  Delivery Details
                </h2>

                <p>
                  Where should we deliver your order?
                </p>

              </div>

            </div>


            {/* NAME */}

            <div className="checkout-form-grid">

              <div className="checkout-field">

                <label htmlFor="fullName">
                  Full Name
                </label>

                <div className="checkout-input-wrapper">

                  <User size={16} />

                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />

                </div>

              </div>


              {/* PHONE */}

              <div className="checkout-field">

                <label htmlFor="phone">
                  Phone Number
                </label>

                <div className="checkout-input-wrapper">

                  <Phone size={16} />

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />

                </div>

              </div>


              {/* EMAIL */}

              <div className="checkout-field checkout-full">

                <label htmlFor="email">
                  Email Address
                </label>

                <div className="checkout-input-wrapper">

                  <Mail size={16} />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />

                </div>

              </div>

            </div>


            {/* =================================
                ADDRESS
            ================================= */}

            <div className="checkout-address-header">

              <div>

                <h3>
                  Delivery Address
                </h3>

                <p>
                  Enter your address manually
                  or use your live location.
                </p>

              </div>

              <button
                type="button"
                className="checkout-location-button"
                onClick={handleUseLocation}
                disabled={locationLoading}
              >

                <Navigation size={15} />

                {locationLoading
                  ? "Locating..."
                  : "Use Live Location"}

              </button>

            </div>


            {locationMessage && (
              <p className="checkout-location-message">
                {locationMessage}
              </p>
            )}


            <div className="checkout-form-grid">

              {/* ADDRESS */}

              <div className="checkout-field checkout-full">

                <label htmlFor="address">
                  Address
                </label>

                <div className="checkout-input-wrapper checkout-textarea-wrapper">

                  <Home size={16} />

                  <textarea
                    id="address"
                    name="address"
                    placeholder="House / Flat / Street / Area"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />

                </div>

              </div>


              {/* CITY */}

              <div className="checkout-field">

                <label htmlFor="city">
                  City
                </label>

                <input
                  id="city"
                  name="city"
                  type="text"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />

              </div>


              {/* STATE */}

              <div className="checkout-field">

                <label htmlFor="state">
                  State
                </label>

                <input
                  id="state"
                  name="state"
                  type="text"
                  placeholder="State"
                  value={formData.state}
                  onChange={handleChange}
                  required
                />

              </div>


              {/* PINCODE */}

              <div className="checkout-field">

                <label htmlFor="pincode">
                  Pincode
                </label>

                <input
                  id="pincode"
                  name="pincode"
                  type="text"
                  inputMode="numeric"
                  maxLength="6"
                  placeholder="6-digit pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  required
                />

              </div>

            </div>


            {/* LOCATION INFO */}

            <div className="checkout-location-info">

              <MapPin size={16} />

              <span>
                You can use your live location
                or enter your complete address
                manually.
              </span>

            </div>

          </section>


          {/* ===================================
              ORDER SUMMARY
          =================================== */}

          <aside className="checkout-summary">

            <div className="checkout-summary-header">

              <div>

                <p>
                  YOUR ORDER
                </p>

                <h2>
                  Order Summary
                </h2>

              </div>

              <span>
                {cart.length}{" "}
                {cart.length === 1
                  ? "item"
                  : "items"}
              </span>

            </div>


            {/* PRODUCTS */}

            <div className="checkout-products">

              {cart.map((product) => (

                <div
                  className="checkout-product"
                  key={product.id}
                >

                  <div className="checkout-product-image">

                    <img
                      src={product.image}
                      alt={product.name}
                    />

                    <span>
                      {product.quantity}
                    </span>

                  </div>

                  <div className="checkout-product-info">

                    <strong>
                      {product.name}
                    </strong>

                    <small>
                      ₹
                      {product.price.toLocaleString(
                        "en-IN"
                      )}{" "}
                      × {product.quantity}
                    </small>

                  </div>

                  <strong className="checkout-product-total">
                    ₹
                    {(
                      product.price *
                      product.quantity
                    ).toLocaleString("en-IN")}
                  </strong>

                </div>

              ))}

            </div>


            {/* TOTALS */}

            <div className="checkout-total-lines">

              <div>

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


              <div>

                <span>
                  Shipping
                </span>

                {shipping === 0 ? (
                  <strong className="checkout-free">
                    FREE
                  </strong>
                ) : (
                  <strong>
                    ₹{shipping}
                  </strong>
                )}

              </div>


              {couponDiscount > 0 && (
                <div>

                  <span>
                    Coupon Discount
                  </span>

                  <strong className="checkout-discount">
                    -₹
                    {couponDiscount.toLocaleString(
                      "en-IN"
                    )}
                  </strong>

                </div>
              )}

            </div>


            {/* FINAL TOTAL */}

            <div className="checkout-grand-total">

              <span>
                Total
              </span>

              <strong>
                ₹
                {total.toLocaleString(
                  "en-IN"
                )}
              </strong>

            </div>


            {/* PLACE ORDER */}

            <button
              type="submit"
              className="checkout-place-order"
            >
              <Lock size={16} />
              Continue to Payment
            </button>


            <p className="checkout-secure">

              <Lock size={12} />

              Secure checkout • Your details
              are protected

            </p>

          </aside>

        </form>

      </div>

    </main>
  );
}

export default Checkout;