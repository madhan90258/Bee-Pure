import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  ShoppingCart,
  Minus,
  Plus,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Leaf,
  Truck,
  Heart,
  Share2,
} from "lucide-react";

import { supabase } from "../lib/supabase";

import {
  isFavorite as checkFavorite,
  addToFavorites,
  removeFromFavorites,
} from "../utils/favorites";

import "../styles/ProductDetails.css";

/* =========================================
   SUPABASE STORAGE IMAGE URL
========================================= */

const getProductImageUrl = (storagePath) => {
  if (!storagePath) {
    return "";
  }

  // If it is already a complete URL
  if (
    storagePath.startsWith("http://") ||
    storagePath.startsWith("https://")
  ) {
    return storagePath;
  }

  const { data } = supabase.storage
    .from("product-images")
    .getPublicUrl(storagePath);

  return data?.publicUrl || "";
};


/* =========================================
   PRODUCT DETAILS
========================================= */

function ProductDetails() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);

  const [quantity, setQuantity] = useState(1);

  const [isFavorite, setIsFavorite] = useState(false);

  const [shareMessage, setShareMessage] = useState("");

  const [loading, setLoading] = useState(true);

  const [errorMessage, setErrorMessage] = useState("");

  const [activeMediaIndex, setActiveMediaIndex] =
    useState(0);

  const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000";


  /* =========================================
     LOAD PRODUCT FROM BACKEND
  ========================================= */

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setErrorMessage("");
        setProduct(null);

        const response = await fetch(
          `${API_URL}/api/products/${encodeURIComponent(id)}`
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message ||
              "Unable to fetch product"
          );
        }

        const backendProduct = result.product;

        /* -------------------------------------
           PRIMARY IMAGE
        ------------------------------------- */

        const primaryImage =
          backendProduct.product_images?.find(
            (image) => image.is_primary
          ) ||
          backendProduct.product_images?.[0];

        /* -------------------------------------
           ALL PRODUCT IMAGES
        ------------------------------------- */

        const images =
          backendProduct.product_images
            ?.map((image) =>
              getProductImageUrl(
                image.storage_path
              )
            )
            .filter(Boolean) || [];

        /* -------------------------------------
           MAP BACKEND PRODUCT
        ------------------------------------- */

        const mappedProduct = {
          id: backendProduct.id,

          name: backendProduct.name,

          category:
            backendProduct.categories?.name || "",

          price:
            Number(backendProduct.price) || 0,

          oldPrice:
            backendProduct.old_price !== null &&
            backendProduct.old_price !== undefined
              ? Number(
                  backendProduct.old_price
                )
              : null,

          image: getProductImageUrl(
            primaryImage?.storage_path
          ),

          images:
            images.length > 0
              ? images
              : [
                  getProductImageUrl(
                    primaryImage?.storage_path
                  ),
                ],

          videos: [],

          rating:
            Number(backendProduct.rating) || 0,

          description:
            backendProduct.description || "",

          stockQuantity:
            Number(
              backendProduct.stock_quantity
            ) || 0,

          slug:
            backendProduct.slug || "",

          farmer:
            backendProduct.farmers || null,
        };

        setProduct(mappedProduct);
      } catch (error) {
        console.error(
          "Failed to load product:",
          error
        );

        setProduct(null);

        setErrorMessage(
          error.message ||
            "Unable to load product"
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadProduct();
    }
  }, [API_URL, id]);


  /* =========================================
     PRODUCT MEDIA
  ========================================== */

  const productMedia = product
    ? [
        ...(product.images?.length
          ? product.images.map((url) => ({
              type: "image",
              url,
            }))
          : product.image
          ? [
              {
                type: "image",
                url: product.image,
              },
            ]
          : []),

        ...(product.videos?.length
          ? product.videos.map((url) => ({
              type: "video",
              url,
            }))
          : []),
      ]
    : [];


  /* =========================================
     RESET GALLERY
  ========================================== */

  useEffect(() => {
    setActiveMediaIndex(0);
    setQuantity(1);
  }, [id]);


  /* =========================================
     CHECK FAVORITE STATUS
  ========================================== */

  useEffect(() => {
    const loadFavoriteStatus = async () => {
      if (!product?.id) {
        return;
      }

      try {
        const favorite =
          await checkFavorite(product.id);

        setIsFavorite(favorite);
      } catch (error) {
        console.error(
          "Failed to load favorite status:",
          error
        );

        setIsFavorite(false);
      }
    };

    loadFavoriteStatus();
  }, [product]);


  /* =========================================
     FAVORITES UPDATED EVENT
  ========================================== */

  useEffect(() => {
    const handleFavoritesUpdate = async () => {
      if (!product?.id) {
        return;
      }

      try {
        const favorite =
          await checkFavorite(product.id);

        setIsFavorite(favorite);
      } catch (error) {
        console.error(
          "Failed to update favorite status:",
          error
        );
      }
    };

    window.addEventListener(
      "favoritesUpdated",
      handleFavoritesUpdate
    );

    return () => {
      window.removeEventListener(
        "favoritesUpdated",
        handleFavoritesUpdate
      );
    };
  }, [product]);


  /* =========================================
     TOGGLE FAVORITE
  ========================================== */

  const handleFavorite = async () => {
    if (!product) {
      return;
    }

    try {
      if (isFavorite) {
        const success =
          await removeFromFavorites(
            product.id
          );

        if (success) {
          setIsFavorite(false);
        }

        return;
      }

      const success =
        await addToFavorites(product);

      if (success) {
        setIsFavorite(true);
      }
    } catch (error) {
      console.error(
        "Failed to update favorite:",
        error
      );
    }
  };


  /* =========================================
     SHARE PRODUCT
  ========================================== */

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

      await navigator.clipboard.writeText(
        productUrl
      );

      setShareMessage(
        "Product link copied!"
      );

      setTimeout(() => {
        setShareMessage("");
      }, 2500);
    } catch (error) {
      console.log(
        "Share cancelled."
      );
    }
  };


  /* =========================================
     ADD TO CART
  ========================================== */

  const handleAddToCart = () => {
    if (!product) {
      return;
    }

    const savedCart =
      JSON.parse(
        localStorage.getItem(
          "beePureCart"
        )
      ) || [];

    const existingProduct =
      savedCart.find(
        (cartProduct) =>
          String(cartProduct.id) ===
          String(product.id)
      );

    let updatedCart;

    if (existingProduct) {
      updatedCart =
        savedCart.map(
          (cartProduct) =>
            String(cartProduct.id) ===
            String(product.id)
              ? {
                  ...cartProduct,

                  quantity:
                    cartProduct.quantity +
                    quantity,
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


  /* =========================================
     BUY NOW
  ========================================== */

  const handleBuyNow = () => {
    handleAddToCart();

    window.location.href =
      "/checkout";
  };


  /* =========================================
     NEXT MEDIA
  ========================================== */

  const handleNextMedia = () => {
    if (productMedia.length <= 1) {
      return;
    }

    setActiveMediaIndex(
      (currentIndex) =>
        (currentIndex + 1) %
        productMedia.length
    );
  };


  /* =========================================
     PREVIOUS MEDIA
  ========================================== */

  const handlePreviousMedia = () => {
    if (productMedia.length <= 1) {
      return;
    }

    setActiveMediaIndex(
      (currentIndex) =>
        (currentIndex -
          1 +
          productMedia.length) %
        productMedia.length
    );
  };


  /* =========================================
     SWIPE SUPPORT
  ========================================== */

  const handleTouchStart = (event) => {
    event.currentTarget.dataset.touchStartX =
      event.touches[0].clientX;
  };


  const handleTouchEnd = (event) => {
    const startX = Number(
      event.currentTarget.dataset.touchStartX
    );

    const endX =
      event.changedTouches[0].clientX;

    const difference =
      startX - endX;

    if (Math.abs(difference) < 50) {
      return;
    }

    if (difference > 0) {
      handleNextMedia();
    } else {
      handlePreviousMedia();
    }
  };


  /* =========================================
     LOADING
  ========================================== */

  if (loading) {
    return (
      <main className="product-not-found">
        <h1>
          Loading Product...
        </h1>

        <p>
          Please wait while we load the
          product.
        </p>
      </main>
    );
  }


  /* =========================================
     PRODUCT NOT FOUND
  ========================================== */

  if (!product) {
    return (
      <main className="product-not-found">
        <h1>
          Product Not Found
        </h1>

        <p>
          {errorMessage ||
            "Sorry, we couldn't find the product you're looking for."}
        </p>

        <Link to="/shop">
          <ArrowLeft size={16} />
          Back to Shop
        </Link>
      </main>
    );
  }


  /* =========================================
     ACTIVE MEDIA
  ========================================== */

  const activeMedia =
    productMedia[activeMediaIndex];


  /* =========================================
     MAIN UI
  ========================================== */

  return (
    <main className="product-details-page">

      <div className="product-details-container">

        {/* ===================================
            BACK TO SHOP
        ==================================== */}

        <Link
          to="/shop"
          className="product-back-link"
        >
          <ArrowLeft size={17} />
          Back to Shop
        </Link>


        {/* ===================================
            PRODUCT DETAILS
        ==================================== */}

        <section className="product-details">

          {/* =================================
              PRODUCT GALLERY
          ================================== */}

          <div className="product-gallery">

            {/* MAIN IMAGE / VIDEO */}

            <div
              className="product-details-image"
              onTouchStart={
                handleTouchStart
              }
              onTouchEnd={
                handleTouchEnd
              }
            >

              {activeMedia?.type ===
              "video" ? (

                <video
                  className="product-main-video"
                  src={activeMedia.url}
                  controls
                  playsInline
                  preload="metadata"
                />

              ) : (

                <img
                  src={
                    activeMedia?.url ||
                    product.image
                  }
                  alt={product.name}
                  onError={(event) => {
                    console.error(
                      "Product image failed to load:",
                      event.currentTarget.src
                    );
                  }}
                />

              )}


              {/* SALE BADGE */}

              {product.oldPrice && (
                <span className="product-sale-badge">
                  SALE
                </span>
              )}


              {/* PREVIOUS */}

              {productMedia.length > 1 && (
                <button
                  type="button"
                  className="product-gallery-arrow product-gallery-prev"
                  onClick={
                    handlePreviousMedia
                  }
                  aria-label="Previous product media"
                >
                  <ArrowLeft size={20} />
                </button>
              )}


              {/* NEXT */}

              {productMedia.length > 1 && (
                <button
                  type="button"
                  className="product-gallery-arrow product-gallery-next"
                  onClick={
                    handleNextMedia
                  }
                  aria-label="Next product media"
                >
                  <ArrowRight size={20} />
                </button>
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
                  onClick={
                    handleFavorite
                  }
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
                  onClick={
                    handleShare
                  }
                  aria-label="Share product"
                >
                  <Share2 size={20} />
                </button>

              </div>

            </div>


            {/* =================================
                THUMBNAILS
            ================================== */}

            {productMedia.length > 1 && (
              <div
                className="product-media-thumbnails"
                aria-label="Product media thumbnails"
              >

                {productMedia.map(
                  (media, index) => (

                    <button
                      key={`${media.url}-${index}`}
                      type="button"
                      className={`product-media-thumbnail ${
                        index ===
                        activeMediaIndex
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        setActiveMediaIndex(
                          index
                        )
                      }
                      aria-label={`View ${
                        media.type
                      } ${index + 1}`}
                    >

                      {media.type ===
                      "video" ? (

                        <div className="product-video-thumbnail">

                          <video
                            src={
                              media.url
                            }
                            muted
                            preload="metadata"
                          />

                          <span className="product-video-label">
                            ▶
                          </span>

                        </div>

                      ) : (

                        <img
                          src={media.url}
                          alt={`${product.name} ${
                            index + 1
                          }`}
                        />

                      )}

                    </button>

                  )
                )}

              </div>
            )}

          </div>


          {/* =================================
              PRODUCT INFORMATION
          ================================== */}

          <div className="product-details-content">

            {/* CATEGORY */}

            <p className="product-details-category">
              {product.category}
            </p>


            {/* NAME */}

            <h1>
              {product.name}
            </h1>


            {/* RATING */}

            <div className="product-details-rating">

              <span>
                {"★".repeat(
                  product.rating
                )}
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
                    (
                      (product.oldPrice -
                        product.price) /
                      product.oldPrice
                    ) * 100
                  )}

                  % OFF

                </span>
              )}

            </div>


            {/* DESCRIPTION */}

            <p className="product-details-description">
              {product.description}
            </p>


            {/* QUANTITY */}

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


            {/* ACTION BUTTONS */}

            <div className="product-actions">

              <button
                type="button"
                className="product-add-cart"
                onClick={
                  handleAddToCart
                }
              >
                <ShoppingCart size={18} />
                Add to Cart
              </button>


              <button
                type="button"
                className="product-buy-now"
                onClick={
                  handleBuyNow
                }
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
                PRODUCT BENEFITS
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