import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  ShoppingCart,
  Minus,
  Plus,
  ArrowLeft,
  ShieldCheck,
  Leaf,
  Truck,
  Check,
} from "lucide-react";

import { addToCart, updateCartQuantity, getCart } from "../utils/cart";

import "../styles/ProductDetails.css";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  // =========================================
  // PRODUCTS
  // =========================================

  const products = [
    {
      id: 1,
      name: "Pure Forest Honey",
      category: "Honey",
      price: 499,
      oldPrice: 599,
      image: "/products/forest-honey.jpg",
      rating: 5,
      description:
        "Pure forest honey collected naturally from trusted local beekeepers. Rich in natural goodness, flavour and nutrients.",
    },

    {
      id: 2,
      name: "Raw Organic Honey",
      category: "Honey",
      price: 399,
      oldPrice: null,
      image: "/products/raw-honey.jpg",
      rating: 5,
      description:
        "Naturally raw and minimally processed honey sourced directly from trusted farmers.",
    },

    {
      id: 3,
      name: "Natural Jaggery",
      category: "Natural Sweeteners",
      price: 249,
      oldPrice: 299,
      image: "/products/jaggery.jpg",
      rating: 4,
      description:
        "Traditional natural jaggery made with care and sourced directly from local producers.",
    },

    {
      id: 4,
      name: "Organic Turmeric",
      category: "Healthy Foods",
      price: 199,
      oldPrice: null,
      image: "/products/turmeric.jpg",
      rating: 5,
      description:
        "Naturally grown turmeric with rich colour, flavour and everyday wellness benefits.",
    },

    {
      id: 5,
      name: "Organic A2 Ghee",
      category: "Healthy Foods",
      price: 699,
      oldPrice: 799,
      image: "/products/ghee.jpg",
      rating: 5,
      description:
        "Traditional A2 ghee made from quality milk and prepared with care.",
    },

    {
      id: 6,
      name: "Forest Bee Honey",
      category: "Honey",
      price: 549,
      oldPrice: null,
      image: "/products/forest-bee-honey.jpg",
      rating: 5,
      description:
        "Authentic forest honey with a naturally rich taste, sourced from local beekeepers.",
    },
  ];

  // =========================================
  // FIND PRODUCT
  // =========================================

  const product = products.find(
    (item) => item.id === Number(id)
  );

  // =========================================
  // PRODUCT NOT FOUND
  // =========================================

  if (!product) {
    return (
      <main className="product-not-found">

        <h1>
          Product Not Found
        </h1>

        <p>
          Sorry, we couldn't find the product you're looking for.
        </p>

        <Link to="/shop">
          <ArrowLeft size={16} />
          Back to Shop
        </Link>

      </main>
    );
  }

  // =========================================
  // DECREASE QUANTITY
  // =========================================

  const decreaseQuantity = () => {
    setQuantity((current) =>
      Math.max(1, current - 1)
    );
  };

  // =========================================
  // INCREASE QUANTITY
  // =========================================

  const increaseQuantity = () => {
    setQuantity((current) =>
      current + 1
    );
  };

  // =========================================
  // ADD TO CART
  // =========================================

  const handleAddToCart = () => {

    // Check if product already exists
    const cart = getCart();

    const existingProduct = cart.find(
      (item) => item.id === product.id
    );

    if (existingProduct) {

      // Existing quantity + selected quantity
      updateCartQuantity(
        product.id,
        existingProduct.quantity + quantity
      );

    } else {

      // Add product first
      addToCart(product);

      // If selected quantity is more than 1,
      // update the quantity accordingly.
      if (quantity > 1) {
        updateCartQuantity(
          product.id,
          quantity
        );
      }
    }

    // Show success state
    setAddedToCart(true);

    // Go to cart after adding
    setTimeout(() => {
      navigate("/cart");
    }, 500);
  };

  // =========================================
  // BUY NOW
  // =========================================

  const handleBuyNow = () => {

    // Add selected product to cart
    const cart = getCart();

    const existingProduct = cart.find(
      (item) => item.id === product.id
    );

    if (existingProduct) {

      updateCartQuantity(
        product.id,
        existingProduct.quantity + quantity
      );

    } else {

      addToCart(product);

      if (quantity > 1) {
        updateCartQuantity(
          product.id,
          quantity
        );
      }
    }

    // Go directly to checkout
    navigate("/checkout");
  };

  // =========================================
  // RENDER
  // =========================================

  return (
    <main className="product-details-page">

      <div className="product-details-container">

        {/* =====================================
            BACK LINK
        ===================================== */}

        <Link
          to="/shop"
          className="product-back-link"
        >
          <ArrowLeft size={17} />
          Back to Shop
        </Link>


        {/* =====================================
            PRODUCT DETAILS
        ===================================== */}

        <section className="product-details">


          {/* ===================================
              PRODUCT IMAGE
          =================================== */}

          <div className="product-details-image">

            <img
              src={product.image}
              alt={product.name}
            />

            {product.oldPrice && (
              <span className="product-sale-badge">
                SALE
              </span>
            )}

          </div>


          {/* ===================================
              PRODUCT CONTENT
          =================================== */}

          <div className="product-details-content">

            {/* CATEGORY */}

            <p className="product-details-category">
              {product.category}
            </p>


            {/* NAME */}

            <h1>
              {product.name}
            </h1>


            {/* =================================
                RATING
            ================================= */}

            <div className="product-details-rating">

              <span>
                {"★".repeat(product.rating)}
              </span>

              <small>
                {product.rating}.0 / 5
              </small>

            </div>


            {/* =================================
                PRICE
            ================================= */}

            <div className="product-details-price">

              <strong>
                ₹{product.price}
              </strong>

              {product.oldPrice && (
                <del>
                  ₹{product.oldPrice}
                </del>
              )}

            </div>


            {/* =================================
                DESCRIPTION
            ================================= */}

            <p className="product-details-description">
              {product.description}
            </p>


            {/* =================================
                QUANTITY
            ================================= */}

            <div className="product-quantity">

              <span>
                Quantity
              </span>

              <div className="quantity-control">

                {/* MINUS */}

                <button
                  type="button"
                  onClick={decreaseQuantity}
                  aria-label="Decrease quantity"
                >
                  <Minus size={15} />
                </button>


                {/* QUANTITY */}

                <strong>
                  {quantity}
                </strong>


                {/* PLUS */}

                <button
                  type="button"
                  onClick={increaseQuantity}
                  aria-label="Increase quantity"
                >
                  <Plus size={15} />
                </button>

              </div>

            </div>


            {/* =================================
                ACTION BUTTONS
            ================================= */}

            <div className="product-actions">

              {/* ADD TO CART */}

              <button
                type="button"
                className={`product-add-cart ${
                  addedToCart ? "added" : ""
                }`}
                onClick={handleAddToCart}
              >

                {addedToCart ? (
                  <>
                    <Check size={18} />

                    Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart size={18} />

                    Add to Cart
                  </>
                )}

              </button>


              {/* BUY NOW */}

              <button
                type="button"
                className="product-buy-now"
                onClick={handleBuyNow}
              >
                Buy Now
              </button>

            </div>


            {/* =================================
                BENEFITS
            ================================= */}

            <div className="product-benefits">


              {/* NATURAL */}

              <div>

                <Leaf size={21} />

                <div>

                  <strong>
                    100% Natural
                  </strong>

                  <span>
                    Pure & unprocessed
                  </span>

                </div>

              </div>


              {/* QUALITY */}

              <div>

                <ShieldCheck size={21} />

                <div>

                  <strong>
                    Quality Assured
                  </strong>

                  <span>
                    Carefully sourced
                  </span>

                </div>

              </div>


              {/* DELIVERY */}

              <div>

                <Truck size={21} />

                <div>

                  <strong>
                    Safe Delivery
                  </strong>

                  <span>
                    Securely packed
                  </span>

                </div>

              </div>


            </div>

          </div>

        </section>

      </div>

    </main>
  );
}

export default ProductDetails;