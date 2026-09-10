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

  const [errors, setErrors] = useState({});

  const [locationLoading, setLocationLoading] =
    useState(false);

  const [locationMessage, setLocationMessage] =
    useState("");


  // =========================================
  // LOAD CART
  // =========================================

  useEffect(() => {
    setCart(getCart());
  }, []);


  // =========================================
  // VALIDATE FIELD
  // =========================================

  const validateField = (name, value) => {

    let error = "";

    switch (name) {

      // ---------------------------------------
      // FULL NAME
      // ---------------------------------------

      case "fullName":

        if (!value.trim()) {

          error = "Please enter your full name.";

        } else if (
          !/^[A-Za-z\s.'-]+$/.test(value.trim())
        ) {

          error =
            "Name can contain only letters and spaces.";

        } else if (value.trim().length < 2) {

          error =
            "Name must be at least 2 characters.";

        } else if (value.trim().length > 50) {

          error =
            "Name must be less than 50 characters.";

        }

        break;


      // ---------------------------------------
      // EMAIL
      // ---------------------------------------

      case "email":

        if (!value.trim()) {

          error =
            "Please enter your email address.";

        } else if (
          !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(
            value.trim()
          )
        ) {

          error =
            "Please enter a valid email address.";

        }

        break;


      // ---------------------------------------
      // PHONE
      // ---------------------------------------

      case "phone": {

        const cleanPhone =
          value.replace(/\D/g, "");

        if (!value.trim()) {

          error =
            "Please enter your phone number.";

        } else if (
          !/^[6-9]\d{9}$/.test(cleanPhone)
        ) {

          error =
            "Please enter a valid 10-digit Indian mobile number.";

        }

        break;
      }


      // ---------------------------------------
      // ADDRESS
      // ---------------------------------------

      case "address":

        if (!value.trim()) {

          error =
            "Please enter your complete address.";

        } else if (value.trim().length < 10) {

          error =
            "Please enter a more complete address.";

        } else if (value.trim().length > 250) {

          error =
            "Address must be less than 250 characters.";

        }

        break;


      // ---------------------------------------
      // CITY
      // ---------------------------------------

      case "city":

        if (!value.trim()) {

          error =
            "Please enter your city.";

        } else if (
          !/^[A-Za-z\s.'-]+$/.test(value.trim())
        ) {

          error =
            "City can contain only letters.";

        } else if (value.trim().length < 2) {

          error =
            "Please enter a valid city.";

        }

        break;


      // ---------------------------------------
      // STATE
      // ---------------------------------------

      case "state":

        if (!value.trim()) {

          error =
            "Please enter your state.";

        } else if (
          !/^[A-Za-z\s.'-]+$/.test(value.trim())
        ) {

          error =
            "State can contain only letters.";

        } else if (value.trim().length < 2) {

          error =
            "Please enter a valid state.";

        }

        break;


      // ---------------------------------------
      // PINCODE
      // ---------------------------------------

      case "pincode":

        if (!value.trim()) {

          error =
            "Please enter your pincode.";

        } else if (!/^\d{6}$/.test(value.trim())) {

          error =
            "Pincode must contain exactly 6 digits.";

        }

        break;


      default:
        break;
    }

    return error;
  };


  // =========================================
  // VALIDATE COMPLETE FORM
  // =========================================

  const validateForm = () => {

    const newErrors = {};

    Object.keys(formData).forEach((field) => {

      const error = validateField(
        field,
        formData[field]
      );

      if (error) {
        newErrors[field] = error;
      }

    });

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };


  // =========================================
  // HANDLE INPUT
  // =========================================

  const handleChange = (event) => {

    const {
      name,
      value,
    } = event.target;


    // Phone: allow only numbers
    if (name === "phone") {

      const numericValue =
        value.replace(/\D/g, "").slice(0, 10);

      setFormData((current) => ({
        ...current,
        [name]: numericValue,
      }));

    }

    // Pincode: allow only numbers
    else if (name === "pincode") {

      const numericValue =
        value.replace(/\D/g, "").slice(0, 6);

      setFormData((current) => ({
        ...current,
        [name]: numericValue,
      }));

    }

    else {

      setFormData((current) => ({
        ...current,
        [name]: value,
      }));

    }


    // Clear current error
    setErrors((current) => ({
      ...current,
      [name]: "",
    }));

  };


  // =========================================
  // HANDLE BLUR
  // =========================================

  const handleBlur = (event) => {

    const {
      name,
      value,
    } = event.target;

    const error = validateField(
      name,
      value
    );

    setErrors((current) => ({
      ...current,
      [name]: error,
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

    setLocationMessage(
      "Getting your location..."
    );


    navigator.geolocation.getCurrentPosition(

      async (position) => {

        const {
          latitude,
          longitude,
        } = position.coords;


        try {

          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
          );


          if (!response.ok) {
            throw new Error(
              "Unable to get location address."
            );
          }


          const data =
            await response.json();


          const address =
            data.address || {};


          setFormData((current) => ({

            ...current,

            address:
              data.display_name ||
              current.address,

            city:
              address.city ||
              address.town ||
              address.village ||
              address.municipality ||
              current.city,

            state:
              address.state ||
              current.state,

            pincode:
              address.postcode ||
              current.pincode,

          }));


          // Clear address-related errors
          setErrors((current) => ({
            ...current,
            address: "",
            city: "",
            state: "",
            pincode: "",
          }));


          setLocationMessage(
            "Location added successfully."
          );

        }

        catch (error) {

          console.error(
            "Location address error:",
            error
          );

          setLocationMessage(
            "Location found, but we couldn't get the address. Please enter it manually."
          );

        }

        finally {

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
    subtotal >= 999
      ? 0
      : 60;

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


    const isValid =
      validateForm();


    if (!isValid) {

      // Scroll to first error
      const firstError =
        document.querySelector(
          ".checkout-field-error"
        );

      if (firstError) {

        firstError.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

      }

      return;
    }


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
          noValidate
        >


          {/* ===================================
              DELIVERY DETAILS
          =================================== */}

          <section className="checkout-card">


            {/* CARD HEADER */}

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


            {/* =================================
                CUSTOMER DETAILS
            ================================= */}

            <div className="checkout-form-grid">


              {/* FULL NAME */}

              <div className="checkout-field">

                <label htmlFor="fullName">
                  Full Name
                </label>


                <div
                  className={`checkout-input-wrapper ${
                    errors.fullName
                      ? "has-error"
                      : ""
                  }`}
                >

                  <User
                    size={16}
                    aria-hidden="true"
                  />


                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    autoComplete="name"
                    maxLength="50"
                    aria-invalid={Boolean(
                      errors.fullName
                    )}
                  />

                </div>


                {errors.fullName && (

                  <span className="checkout-field-error">
                    {errors.fullName}
                  </span>

                )}

              </div>


              {/* PHONE */}

              <div className="checkout-field">

                <label htmlFor="phone">
                  Phone Number
                </label>


                <div
                  className={`checkout-input-wrapper ${
                    errors.phone
                      ? "has-error"
                      : ""
                  }`}
                >

                  <Phone
                    size={16}
                    aria-hidden="true"
                  />


                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    autoComplete="tel"
                    inputMode="numeric"
                    maxLength="10"
                    aria-invalid={Boolean(
                      errors.phone
                    )}
                  />

                </div>


                {errors.phone && (

                  <span className="checkout-field-error">
                    {errors.phone}
                  </span>

                )}

              </div>


              {/* EMAIL */}

              <div className="checkout-field checkout-full">

                <label htmlFor="email">
                  Email Address
                </label>


                <div
                  className={`checkout-input-wrapper ${
                    errors.email
                      ? "has-error"
                      : ""
                  }`}
                >

                  <Mail
                    size={16}
                    aria-hidden="true"
                  />


                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    autoComplete="email"
                    aria-invalid={Boolean(
                      errors.email
                    )}
                  />

                </div>


                {errors.email && (

                  <span className="checkout-field-error">
                    {errors.email}
                  </span>

                )}

              </div>

            </div>


            {/* =================================
                DELIVERY ADDRESS HEADER
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


            {/* LOCATION MESSAGE */}

            {locationMessage && (

              <p className="checkout-location-message">
                {locationMessage}
              </p>

            )}


            {/* =================================
                ADDRESS FIELDS
            ================================= */}

            <div className="checkout-form-grid">


              {/* ADDRESS */}

              <div className="checkout-field checkout-full">

                <label htmlFor="address">
                  Address
                </label>


                <div
                  className={`checkout-input-wrapper checkout-textarea-wrapper ${
                    errors.address
                      ? "has-error"
                      : ""
                  }`}
                >

                  <Home
                    size={16}
                    aria-hidden="true"
                  />


                  <textarea
                    id="address"
                    name="address"
                    placeholder="House / Flat / Street / Area"
                    value={formData.address}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    maxLength="250"
                    aria-invalid={Boolean(
                      errors.address
                    )}
                  />

                </div>


                {errors.address && (

                  <span className="checkout-field-error">
                    {errors.address}
                  </span>

                )}

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
                  onBlur={handleBlur}
                  autoComplete="address-level2"
                  maxLength="50"
                  className={
                    errors.city
                      ? "input-error"
                      : ""
                  }
                  aria-invalid={Boolean(
                    errors.city
                  )}
                />


                {errors.city && (

                  <span className="checkout-field-error">
                    {errors.city}
                  </span>

                )}

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
                  onBlur={handleBlur}
                  autoComplete="address-level1"
                  maxLength="50"
                  className={
                    errors.state
                      ? "input-error"
                      : ""
                  }
                  aria-invalid={Boolean(
                    errors.state
                  )}
                />


                {errors.state && (

                  <span className="checkout-field-error">
                    {errors.state}
                  </span>

                )}

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
                  onBlur={handleBlur}
                  autoComplete="postal-code"
                  className={
                    errors.pincode
                      ? "input-error"
                      : ""
                  }
                  aria-invalid={Boolean(
                    errors.pincode
                  )}
                />


                {errors.pincode && (

                  <span className="checkout-field-error">
                    {errors.pincode}
                  </span>

                )}

              </div>

            </div>


            {/* =================================
                LOCATION INFO
            ================================= */}

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


            {/* SUMMARY HEADER */}

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


            {/* GRAND TOTAL */}

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


            {/* SECURE MESSAGE */}

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