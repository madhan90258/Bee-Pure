import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ShoppingCart,
  Minus,
  Plus,
  ArrowLeft,
  ShieldCheck,
  Leaf,
  Truck,
  Heart,
  Share2,
} from "lucide-react";

import "../styles/ProductDetails.css";

function ProductDetails() {
  const { id } = useParams();

  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [shareMessage, setShareMessage] = useState("");

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
  // LOAD FAVORITE STATUS
  // =========================================

  useEffect(() => {
    if (!product) {
      return;
    }

    const savedFavorites =
      JSON.parse(
        localStorage.getItem("beePureFavorites")
      ) || [];

    const favorite = savedFavorites.some(
      (favoriteProduct) =>
        Number(favoriteProduct.id) === product.id
    );

    setIsFavorite(favorite);
  }, [product]);

  // =========================================
  // TOGGLE FAVORITE
  // =========================================

  const handleFavorite = () => {
    if (!product) {
      return;
    }

    const savedFavorites =
      JSON.parse(
        localStorage.getItem("beePureFavorites")
      ) || [];

    const alreadyFavorite = savedFavorites.some(
      (favoriteProduct) =>
        Number(favoriteProduct.id) === product.id
    );

    let updatedFavorites;

    if (alreadyFavorite) {
      updatedFavorites = savedFavorites.filter(
        (favoriteProduct) =>
          Number(favoriteProduct.id) !== product.id
      );

      setIsFavorite(false);
    } else {
      updatedFavorites = [
        ...savedFavorites,
        product,
      ];

      setIsFavorite(true);
    }

    localStorage.setItem(
      "beePureFavorites",
      JSON.stringify(updatedFavorites)
    );

    // Tell navbar / other components that favorites changed
    window.dispatchEvent(
      new Event("favoritesUpdated")
    );
  };

  // =========================================
  // SHARE PRODUCT
  // =========================================

  const handleShare = async () => {
    if (!product) {
      return;
    }

    const productUrl =
      `${window.location.origin}/product/${product.id}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name} from Bee Pure.`,
          url: productUrl,
        });

        return;
      }

      await navigator.clipboard.writeText(productUrl);

      setShareMessage("Product link copied!");

      setTimeout(() => {
        setShareMessage("");
      }, 2500);
    } catch (error) {
      // User cancelled sharing
      console.log("Share cancelled.");
    }
  };

  // =========================================
  // ADD TO CART
  // =========================================

  const handleAddToCart = () => {
    if (!product) {
      return;
    }

    const savedCart =
      JSON.parse(
        localStorage.getItem("beePureCart")
      ) || [];

    const existingProduct = savedCart.find(
      (cartProduct) =>
        Number(cartProduct.id) === product.id
    );

    let updatedCart;

    if (existingProduct) {
      updatedCart = savedCart.map(
        (cartProduct) =>
          Number(cartProduct.id) === product.id
            ? {
                ...cartProduct,
                quantity:
                  cartProduct.quantity + quantity,
              }
            : cartProduct
      );
    } else {
      updatedCart = [
        ...savedCart,
        {
          ...product,
          quantity,
        },
      ];
    }

    localStorage.setItem(
      "beePureCart",
      JSON.stringify(updatedCart)
    );

    window.dispatchEvent(
      new Event("cartUpdated")
    );
  };

  // =========================================
  // BUY NOW
  // =========================================

  const handleBuyNow = () => {
    handleAddToCart();

    window.location.href = "/checkout";
  };

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
          Sorry, we couldn't find the product
          you're looking for.
        </p>

        <Link to="/shop">
          <ArrowLeft size={16} />
          Back to Shop
        </Link>

      </main>
    );
  }

  return (
    <main className="product-details-page">

      <div className="product-details-container">

        {/* =====================================
            BACK TO SHOP
        ====================================== */}

        <Link
          to="/shop"
          className="product-back-link"
        >
          <ArrowLeft size={17} />
          Back to Shop
        </Link>


        {/* =====================================
            PRODUCT
        ====================================== */}

        <section className="product-details">

          {/* ===================================
              PRODUCT IMAGE
          ==================================== */}

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

            {/* IMAGE ACTIONS */}

            <div className="product-image-actions">

              <button
                type="button"
                className={`product-icon-button ${
                  isFavorite
                    ? "favorite-active"
                    : ""
                }`}
                onClick={handleFavorite}
                aria-label={
                  isFavorite
                    ? "Remove from favorites"
                    : "Add to favorites"
                }
              >
                <Heart
                  size={20}
                  fill={
                    isFavorite
                      ? "currentColor"
                      : "none"
                  }
                />
              </button>


              <button
                type="button"
                className="product-icon-button"
                onClick={handleShare}
                aria-label="Share product"
              >
                <Share2 size={20} />
              </button>

            </div>

          </div>


          {/* ===================================
              PRODUCT INFORMATION
          ==================================== */}

          <div className="product-details-content">

            <p className="product-details-category">
              {product.category}
            </p>

            <h1>
              {product.name}
            </h1>


            {/* RATING */}

            <div className="product-details-rating">

              <span>
                {"★".repeat(product.rating)}
              </span>

              <small>
                {product.rating}.0 / 5
              </small>

            </div>


            {/* PRICE */}

            <div className="product-details-price">

              <strong>
                ₹{product.price}
              </strong>

              {product.oldPrice && (
                <del>
                  ₹{product.oldPrice}
                </del>
              )}

              {product.oldPrice && (
                <span className="product-discount">
                  {Math.round(
                    ((product.oldPrice -
                      product.price) /
                      product.oldPrice) *
                      100
                  )}
                  % OFF
                </span>
              )}

            </div>


            {/* DESCRIPTION */}

            <p className="product-details-description">
              {product.description}
            </p>


            {/* =================================
                QUANTITY
            ================================== */}

            <div className="product-quantity">

              <span>
                Quantity
              </span>

              <div className="quantity-control">

                <button
                  type="button"
                  onClick={() =>
                    setQuantity(
                      (current) =>
                        Math.max(
                          1,
                          current - 1
                        )
                    )
                  }
                  aria-label="Decrease quantity"
                >
                  <Minus size={15} />
                </button>

                <strong>
                  {quantity}
                </strong>

                <button
                  type="button"
                  onClick={() =>
                    setQuantity(
                      (current) =>
                        current + 1
                    )
                  }
                  aria-label="Increase quantity"
                >
                  <Plus size={15} />
                </button>

              </div>

            </div>


            {/* =================================
                ACTIONS
            ================================== */}

            <div className="product-actions">

              <button
                type="button"
                className="product-add-cart"
                onClick={handleAddToCart}
              >
                <ShoppingCart size={18} />
                Add to Cart
              </button>

              <button
                type="button"
                className="product-buy-now"
                onClick={handleBuyNow}
              >
                Buy Now
              </button>

            </div>


            {/* SHARE MESSAGE */}

            {shareMessage && (
              <p className="product-share-message">
                {shareMessage}
              </p>
            )}


            {/* =================================
                BENEFITS
            ================================== */}

            <div className="product-benefits">

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