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
  Plus,
  CheckCircle,
  Loader2,
  Tag,
  Trash2,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { supabase } from "../lib/supabase";

import "../styles/Checkout.css";


const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";


/* =========================================
   EMPTY ADDRESS FORM
========================================= */

const emptyAddressForm = {
  fullName: "",
  phone: "",
  address: "",
  addressLine2: "",
  city: "",
  state: "",
  pincode: "",
  latitude: null,
  longitude: null,
};


/* =========================================
   GET IMAGE URL
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

  const {
    data,
  } = supabase.storage
    .from("product-images")
    .getPublicUrl(storagePath);

  return data?.publicUrl || "";
};


/* =========================================
   MAP BACKEND CART ITEM
========================================= */

const mapCartItem = (
  item
) => {
  const product =
    item.products;

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
    cartItemId:
      item.id,

    id:
      product.id,

    name:
      product.name,

    price:
      Number(product.price) || 0,

    quantity:
      Number(item.quantity) || 1,

    stockQuantity:
      Number(
        product.stock_quantity
      ) || 0,

    image:
      getProductImageUrl(
        primaryImage?.storage_path
      ),
  };
};


/* =========================================
   CHECKOUT
========================================= */

function Checkout() {
  const navigate =
    useNavigate();


  /* =========================================
     STATE
  ========================================== */

  const [cart, setCart] =
    useState([]);

  const [addresses, setAddresses] =
    useState([]);

  const [selectedAddressId, setSelectedAddressId] =
    useState("");

  const [showNewAddress, setShowNewAddress] =
    useState(false);

  const [addressForm, setAddressForm] =
    useState(
      emptyAddressForm
    );

  const [loading, setLoading] =
    useState(true);

  const [savingAddress, setSavingAddress] =
    useState(false);

  const [placingOrder, setPlacingOrder] =
    useState(false);

  const [error, setError] =
    useState("");

  const [addressError, setAddressError] =
    useState("");

  const [locationLoading, setLocationLoading] =
    useState(false);

  const [locationMessage, setLocationMessage] =
    useState("");


  /* =========================================
     COUPON
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
          "Please login to continue."
        );
      }

      return token;
    };


  /* =========================================
     LOAD CART + ADDRESSES
  ========================================== */

  const loadCheckoutData =
    async () => {
      try {
        setLoading(true);
        setError("");

        const token =
          await getAccessToken();


        /* -------------------------------------
           CART
        ------------------------------------- */

        const cartResponse =
          await fetch(
            `${API_URL}/api/cart`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const cartResult =
          await cartResponse.json();

        if (
          !cartResponse.ok ||
          !cartResult.success
        ) {
          throw new Error(
            cartResult.message ||
              "Unable to load your cart."
          );
        }

        const mappedCart =
          (cartResult.cart || [])
            .map(mapCartItem)
            .filter(Boolean);

        setCart(mappedCart);


        /* -------------------------------------
           EMPTY CART
        ------------------------------------- */

        if (
          mappedCart.length === 0
        ) {
          navigate("/cart");
          return;
        }


        /* -------------------------------------
           ADDRESSES
        ------------------------------------- */

        const addressResponse =
          await fetch(
            `${API_URL}/api/addresses`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const addressResult =
          await addressResponse.json();

        if (
          !addressResponse.ok ||
          !addressResult.success
        ) {
          throw new Error(
            addressResult.message ||
              "Unable to load addresses."
          );
        }

        const customerAddresses =
          addressResult.addresses ||
          [];

        setAddresses(
          customerAddresses
        );


        /* -------------------------------------
           SELECT DEFAULT ADDRESS
        ------------------------------------- */

        const defaultAddress =
          customerAddresses.find(
            (address) =>
              address.is_default
          );

        if (defaultAddress) {
          setSelectedAddressId(
            defaultAddress.id
          );
        } else if (
          customerAddresses.length > 0
        ) {
          setSelectedAddressId(
            customerAddresses[0].id
          );
        } else {
          setShowNewAddress(true);
        }

      } catch (err) {
        console.error(
          "Checkout loading error:",
          err
        );

        if (
          err.message?.toLowerCase()
            .includes("login")
        ) {
          return;
        }

        setError(
          err.message ||
            "Unable to load checkout."
        );
      } finally {
        setLoading(false);
      }
    };


  /* =========================================
     INITIAL LOAD
  ========================================== */

  useEffect(() => {
    loadCheckoutData();
  }, []);


  /* =========================================
     SUBTOTAL
  ========================================== */

  const subtotal =
    cart.reduce(
      (
        total,
        product
      ) =>
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
     VALIDATE ADDRESS FIELD
  ========================================== */

  const validateAddressField =
    (
      name,
      value
    ) => {
      let error = "";

      switch (name) {

        case "fullName":

          if (!value.trim()) {
            error =
              "Please enter your full name.";
          } else if (
            !/^[A-Za-z\s.'-]+$/.test(
              value.trim()
            )
          ) {
            error =
              "Name can contain only letters and spaces.";
          } else if (
            value.trim().length < 2
          ) {
            error =
              "Name must be at least 2 characters.";
          }

          break;


        case "phone": {

          const phone =
            value.replace(
              /\D/g,
              ""
            );

          if (!value.trim()) {
            error =
              "Please enter your phone number.";
          } else if (
            !/^[6-9]\d{9}$/.test(
              phone
            )
          ) {
            error =
              "Please enter a valid 10-digit Indian mobile number.";
          }

          break;
        }


        case "address":

          if (!value.trim()) {
            error =
              "Please enter your complete address.";
          } else if (
            value.trim().length < 10
          ) {
            error =
              "Please enter a more complete address.";
          }

          break;


        case "city":

          if (!value.trim()) {
            error =
              "Please enter your city.";
          }

          break;


        case "state":

          if (!value.trim()) {
            error =
              "Please enter your state.";
          }

          break;


        case "pincode":

          if (!/^\d{6}$/.test(
            value.trim()
          )) {
            error =
              "Pincode must contain exactly 6 digits.";
          }

          break;


        default:
          break;
      }

      return error;
    };


  /* =========================================
     VALIDATE ADDRESS
  ========================================== */

  const validateAddress =
    () => {
      const errors = {};

      const requiredFields = [
        "fullName",
        "phone",
        "address",
        "city",
        "state",
        "pincode",
      ];

      requiredFields.forEach(
        (field) => {
          const fieldError =
            validateAddressField(
              field,
              addressForm[field]
            );

          if (fieldError) {
            errors[field] =
              fieldError;
          }
        }
      );

      return errors;
    };


  /* =========================================
     ADDRESS INPUT
  ========================================== */

  const handleAddressChange =
    (event) => {
      const {
        name,
        value,
      } = event.target;

      let nextValue =
        value;

      if (name === "phone") {
        nextValue =
          value
            .replace(/\D/g, "")
            .slice(0, 10);
      }

      if (name === "pincode") {
        nextValue =
          value
            .replace(/\D/g, "")
            .slice(0, 6);
      }

      setAddressForm(
        (current) => ({
          ...current,
          [name]:
            nextValue,
        })
      );

      setAddressError("");
    };


  /* =========================================
     USE LIVE LOCATION
  ========================================== */

  const handleUseLocation =
    () => {
      if (
        !navigator.geolocation
      ) {
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
        async (
          position
        ) => {
          const {
            latitude,
            longitude,
          } =
            position.coords;

          try {
            const response =
              await fetch(
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

            setAddressForm(
              (current) => ({
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

                latitude,
                longitude,
              })
            );

            setAddressError("");

            setLocationMessage(
              "Location added successfully."
            );

          } catch (err) {
            console.error(
              "Location error:",
              err
            );

            setLocationMessage(
              "Location found, but we couldn't get the address. Please enter it manually."
            );

          } finally {
            setLocationLoading(false);
          }
        },

        (err) => {
          console.error(
            "Geolocation error:",
            err
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


  /* =========================================
     CREATE NEW ADDRESS
  ========================================== */

  const handleSaveAddress =
    async () => {
      const validationErrors =
        validateAddress();

      if (
        Object.keys(
          validationErrors
        ).length > 0
      ) {
        setAddressError(
          Object.values(
            validationErrors
          )[0]
        );

        return;
      }

      try {
        setSavingAddress(true);
        setAddressError("");

        const token =
          await getAccessToken();

        const response =
          await fetch(
            `${API_URL}/api/addresses`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body: JSON.stringify({
                full_name:
                  addressForm.fullName.trim(),

                phone:
                  addressForm.phone.trim(),

                address_line_1:
                  addressForm.address.trim(),

                address_line_2:
                  addressForm.addressLine2.trim() ||
                  null,

                city:
                  addressForm.city.trim(),

                state:
                  addressForm.state.trim(),

                pincode:
                  addressForm.pincode.trim(),

                latitude:
                  addressForm.latitude,

                longitude:
                  addressForm.longitude,

                is_default:
                  addresses.length === 0,
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
              "Unable to save address."
          );
        }

        const newAddress =
          result.address;

        setAddresses(
          (current) => [
            newAddress,
            ...current,
          ]
        );

        setSelectedAddressId(
          newAddress.id
        );

        setShowNewAddress(
          false
        );

        setAddressForm(
          emptyAddressForm
        );

        setLocationMessage("");

      } catch (err) {
        console.error(
          "Save address error:",
          err
        );

        setAddressError(
          err.message ||
            "Unable to save address."
        );

      } finally {
        setSavingAddress(false);
      }
    };


  /* =========================================
     APPLY COUPON
  ========================================== */

  const handleApplyCoupon =
    async () => {
      if (
        !couponCode.trim()
      ) {
        setCouponError(
          "Please enter a coupon code."
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
          "Coupon error:",
          err
        );

        setAppliedCoupon(
          null
        );

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
     PLACE ORDER
  ========================================== */

  const handlePlaceOrder =
    async (event) => {
      event.preventDefault();

      setError("");

      if (!selectedAddressId) {
        setError(
          "Please select or add a delivery address."
        );

        return;
      }

      if (cart.length === 0) {
        setError(
          "Your cart is empty."
        );

        navigate("/cart");

        return;
      }

      try {
        setPlacingOrder(true);

        const token =
          await getAccessToken();

        /*
         * The backend calculates the final
         * subtotal, shipping, discount and
         * total again from the database.
         *
         * We only send:
         * - address_id
         * - coupon_code
         */

        const response =
          await fetch(
            `${API_URL}/api/orders`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body: JSON.stringify({
                address_id:
                  selectedAddressId,

                coupon_code:
                  appliedCoupon?.code ||
                  null,
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
              "Unable to create your order."
          );
        }

        /*
         * Razorpay will be connected in
         * the final payment phase.
         *
         * For now the backend order is
         * created with payment_status:
         * pending.
         */

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

        navigate("/account", {
          state: {
            orderCreated: true,

            order:
              result.order,
          },
        });

      } catch (err) {
        console.error(
          "Place order error:",
          err
        );

        setError(
          err.message ||
            "Unable to place your order."
        );

      } finally {
        setPlacingOrder(false);
      }
    };


  /* =========================================
     LOADING
  ========================================== */

  if (loading) {
    return (
      <main className="checkout-page">

        <div className="checkout-empty">

          <Loader2
            size={40}
            className="checkout-spinner"
          />

          <h1>
            Loading Checkout...
          </h1>

          <p>
            Preparing your cart and
            delivery information.
          </p>

        </div>

      </main>
    );
  }


  /* =========================================
     EMPTY CART
  ========================================== */

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


  /* =========================================
     CHECKOUT UI
  ========================================== */

  return (
    <main className="checkout-page">

      <div className="checkout-container">

        {/* =====================================
            HEADER
        ====================================== */}

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
            GLOBAL ERROR
        ====================================== */}

        {error && (
          <div className="checkout-page-error">
            {error}
          </div>
        )}


        <form
          className="checkout-layout"
          onSubmit={
            handlePlaceOrder
          }
          noValidate
        >

          {/* ===================================
              LEFT SIDE
          ==================================== */}

          <div className="checkout-left">


            {/* =================================
                SAVED ADDRESSES
            ================================= */}

            <section className="checkout-card">

              <div className="checkout-card-header">

                <div className="checkout-card-icon">
                  <MapPin size={18} />
                </div>

                <div>

                  <h2>
                    Delivery Address
                  </h2>

                  <p>
                    Select where you'd like
                    your order delivered.
                  </p>

                </div>

              </div>


              {/* SAVED ADDRESSES */}

              {addresses.length > 0 && (
                <div className="checkout-address-list">

                  {addresses.map(
                    (address) => {

                      const selected =
                        selectedAddressId ===
                        address.id;

                      return (
                        <button
                          type="button"
                          key={address.id}
                          className={`checkout-saved-address ${
                            selected
                              ? "selected"
                              : ""
                          }`}
                          onClick={() => {
                            setSelectedAddressId(
                              address.id
                            );

                            setShowNewAddress(
                              false
                            );
                          }}
                        >

                          <span className="checkout-address-radio">

                            {selected && (
                              <CheckCircle
                                size={18}
                              />
                            )}

                          </span>

                          <span className="checkout-address-details">

                            <strong>
                              {
                                address.full_name
                              }
                            </strong>

                            <span>
                              {
                                address.phone
                              }
                            </span>

                            <span>
                              {
                                address.address_line_1
                              }
                              {address.address_line_2 &&
                                `, ${address.address_line_2}`}
                            </span>

                            <span>
                              {
                                address.city
                              }
                              ,{" "}
                              {
                                address.state
                              }{" "}
                              -{" "}
                              {
                                address.pincode
                              }
                            </span>

                            {address.is_default && (
                              <small>
                                Default Address
                              </small>
                            )}

                          </span>

                        </button>
                      );
                    }
                  )}

                </div>
              )}


              {/* ADD NEW ADDRESS BUTTON */}

              {!showNewAddress && (
                <button
                  type="button"
                  className="checkout-add-address"
                  onClick={() => {
                    setShowNewAddress(
                      true
                    );

                    setSelectedAddressId(
                      ""
                    );
                  }}
                >

                  <Plus size={16} />

                  Add New Address

                </button>
              )}


              {/* =================================
                  NEW ADDRESS
              ================================== */}

              {showNewAddress && (

                <div className="checkout-new-address">

                  <div className="checkout-address-header">

                    <div>

                      <h3>
                        Add New Address
                      </h3>

                      <p>
                        Enter your delivery
                        information.
                      </p>

                    </div>


                    <button
                      type="button"
                      className="checkout-location-button"
                      onClick={
                        handleUseLocation
                      }
                      disabled={
                        locationLoading
                      }
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


                    {/* NAME */}

                    <div className="checkout-field">

                      <label htmlFor="checkout-fullName">
                        Full Name
                      </label>

                      <div className="checkout-input-wrapper">

                        <User size={16} />

                        <input
                          id="checkout-fullName"
                          name="fullName"
                          type="text"
                          placeholder="Enter your full name"
                          value={
                            addressForm.fullName
                          }
                          onChange={
                            handleAddressChange
                          }
                          maxLength="50"
                          autoComplete="name"
                        />

                      </div>

                    </div>


                    {/* PHONE */}

                    <div className="checkout-field">

                      <label htmlFor="checkout-phone">
                        Phone Number
                      </label>

                      <div className="checkout-input-wrapper">

                        <Phone size={16} />

                        <input
                          id="checkout-phone"
                          name="phone"
                          type="tel"
                          placeholder="10-digit mobile number"
                          value={
                            addressForm.phone
                          }
                          onChange={
                            handleAddressChange
                          }
                          maxLength="10"
                          inputMode="numeric"
                          autoComplete="tel"
                        />

                      </div>

                    </div>


                    {/* ADDRESS */}

                    <div className="checkout-field checkout-full">

                      <label htmlFor="checkout-address">
                        Address
                      </label>

                      <div className="checkout-input-wrapper checkout-textarea-wrapper">

                        <Home size={16} />

                        <textarea
                          id="checkout-address"
                          name="address"
                          rows="3"
                          placeholder="House / Flat / Street / Area"
                          value={
                            addressForm.address
                          }
                          onChange={
                            handleAddressChange
                          }
                          maxLength="250"
                        />

                      </div>

                    </div>


                    {/* ADDRESS LINE 2 */}

                    <div className="checkout-field checkout-full">

                      <label htmlFor="checkout-addressLine2">
                        Address Line 2
                        <span>
                          {" "}
                          (Optional)
                        </span>
                      </label>

                      <input
                        id="checkout-addressLine2"
                        name="addressLine2"
                        type="text"
                        placeholder="Apartment, landmark, etc."
                        value={
                          addressForm.addressLine2
                        }
                        onChange={
                          handleAddressChange
                        }
                        maxLength="150"
                      />

                    </div>


                    {/* CITY */}

                    <div className="checkout-field">

                      <label htmlFor="checkout-city">
                        City
                      </label>

                      <input
                        id="checkout-city"
                        name="city"
                        type="text"
                        placeholder="City"
                        value={
                          addressForm.city
                        }
                        onChange={
                          handleAddressChange
                        }
                        maxLength="50"
                        autoComplete="address-level2"
                      />

                    </div>


                    {/* STATE */}

                    <div className="checkout-field">

                      <label htmlFor="checkout-state">
                        State
                      </label>

                      <input
                        id="checkout-state"
                        name="state"
                        type="text"
                        placeholder="State"
                        value={
                          addressForm.state
                        }
                        onChange={
                          handleAddressChange
                        }
                        maxLength="50"
                        autoComplete="address-level1"
                      />

                    </div>


                    {/* PINCODE */}

                    <div className="checkout-field">

                      <label htmlFor="checkout-pincode">
                        Pincode
                      </label>

                      <input
                        id="checkout-pincode"
                        name="pincode"
                        type="tel"
                        placeholder="6-digit pincode"
                        value={
                          addressForm.pincode
                        }
                        onChange={
                          handleAddressChange
                        }
                        maxLength="6"
                        inputMode="numeric"
                        autoComplete="postal-code"
                      />

                    </div>

                  </div>


                  {/* ADDRESS ERROR */}

                  {addressError && (
                    <p className="checkout-field-error">
                      {addressError}
                    </p>
                  )}


                  {/* ADDRESS ACTIONS */}

                  <div className="checkout-address-actions">

                    <button
                      type="button"
                      className="checkout-save-address"
                      onClick={
                        handleSaveAddress
                      }
                      disabled={
                        savingAddress
                      }
                    >

                      {savingAddress ? (
                        <>
                          <Loader2
                            size={15}
                            className="checkout-spinner"
                          />

                          Saving...
                        </>
                      ) : (
                        <>
                          <CheckCircle
                            size={15}
                          />

                          Save Address
                        </>
                      )}

                    </button>


                    {addresses.length > 0 && (
                      <button
                        type="button"
                        className="checkout-cancel-address"
                        onClick={() => {

                          setShowNewAddress(
                            false
                          );

                          const defaultAddress =
                            addresses.find(
                              (address) =>
                                address.is_default
                            );

                          setSelectedAddressId(
                            defaultAddress?.id ||
                              addresses[0]?.id ||
                              ""
                          );

                          setAddressForm(
                            emptyAddressForm
                          );

                          setAddressError("");

                        }}
                      >
                        Cancel
                      </button>
                    )}

                  </div>

                </div>
              )}

            </section>


            {/* =================================
                COUPON
            ================================== */}

            <section className="checkout-card">

              <div className="checkout-card-header">

                <div className="checkout-card-icon">
                  <Tag size={18} />
                </div>

                <div>

                  <h2>
                    Coupon
                  </h2>

                  <p>
                    Have a coupon code?
                  </p>

                </div>

              </div>


              {!appliedCoupon ? (

                <div className="checkout-coupon-form">

                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={
                      couponCode
                    }
                    onChange={(event) => {
                      setCouponCode(
                        event.target.value
                      );

                      setCouponError("");
                    }}
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
                      ? "Applying..."
                      : "Apply"}

                  </button>

                </div>

              ) : (

                <div className="checkout-coupon-applied">

                  <div>

                    <strong>
                      ✓{" "}
                      {
                        appliedCoupon.code
                      }
                    </strong>

                    <span>
                      Coupon applied
                    </span>

                  </div>

                  <button
                    type="button"
                    onClick={
                      handleRemoveCoupon
                    }
                  >
                    <Trash2
                      size={14}
                    />

                    Remove
                  </button>

                </div>

              )}


              {couponError && (
                <p className="checkout-coupon-error">
                  {couponError}
                </p>
              )}

            </section>

          </div>


          {/* ===================================
              RIGHT SIDE SUMMARY
          ==================================== */}

          <aside className="checkout-summary">

            <div className="checkout-summary-card">

              <h2>
                Your Order
              </h2>


              {/* PRODUCTS */}

              <div className="checkout-order-items">

                {cart.map(
                  (product) => (
                    <div
                      className="checkout-order-item"
                      key={
                        product.cartItemId
                      }
                    >

                      <div className="checkout-order-image">

                        <img
                          src={
                            product.image
                          }
                          alt={
                            product.name
                          }
                        />

                        <span>
                          {
                            product.quantity
                          }
                        </span>

                      </div>

                      <div className="checkout-order-details">

                        <strong>
                          {
                            product.name
                          }
                        </strong>

                        <span>
                          ₹
                          {
                            product.price
                          }
                          {" "}×{" "}
                          {
                            product.quantity
                          }
                        </span>

                      </div>

                      <strong>
                        ₹
                        {(
                          product.price *
                          product.quantity
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </strong>

                    </div>
                  )
                )}

              </div>


              {/* SUBTOTAL */}

              <div className="checkout-summary-row">

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

              <div className="checkout-summary-row">

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


              {/* DISCOUNT */}

              {couponDiscount > 0 && (
                <div className="checkout-summary-row checkout-discount">

                  <span>
                    Discount
                  </span>

                  <strong>
                    -₹
                    {
                      couponDiscount.toLocaleString(
                        "en-IN",
                        {
                          maximumFractionDigits: 2,
                        }
                      )
                    }
                  </strong>

                </div>
              )}


              {/* TOTAL */}

              <div className="checkout-total">

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


              {/* PLACE ORDER */}

              <button
                type="submit"
                className="checkout-place-order"
                disabled={
                  placingOrder ||
                  !selectedAddressId
                }
              >

                {placingOrder ? (
                  <>
                    <Loader2
                      size={17}
                      className="checkout-spinner"
                    />

                    Creating Order...
                  </>
                ) : (
                  <>
                    <Lock size={16} />

                    Place Order
                  </>
                )}

              </button>


              <p className="checkout-secure-note">

                <Lock size={13} />

                Your information is
                securely protected.

              </p>


              {/* SHIPPING NOTE */}

              {subtotal < 999 && (
                <p className="checkout-shipping-note">

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

            </div>

          </aside>

        </form>

      </div>

    </main>
  );
}


export default Checkout;