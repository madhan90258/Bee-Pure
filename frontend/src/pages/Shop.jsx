import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  ShoppingCart,
  Loader2,
  Check,
} from "lucide-react";

import { supabase } from "../lib/supabase";

import "../styles/Shop.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

/* =========================================
   SUPABASE STORAGE IMAGE URL
========================================= */

const getProductImageUrl = (storagePath) => {
  if (!storagePath) {
    return "";
  }

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
   SHOP
========================================= */

function Shop() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [addingProductId, setAddingProductId] =
    useState(null);

  const [addedProductIds, setAddedProductIds] =
    useState([]);


  /* =========================================
     LOAD PRODUCTS FROM BACKEND
  ========================================== */

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/products?limit=100`
        );

        const result = await response.json();

        if (
          !response.ok ||
          !result.success
        ) {
          throw new Error(
            result.message ||
              "Unable to fetch products"
          );
        }

        const mappedProducts =
          (result.products || []).map(
            (product) => {
              const primaryImage =
                product.product_images?.find(
                  (image) =>
                    image.is_primary
                ) ||
                product.product_images?.[0];

              return {
                id: product.id,

                name: product.name,

                category:
                  product.categories?.name ||
                  "",

                farmer:
                  product.farmers?.name ||
                  "",

                price:
                  Number(product.price) || 0,

                oldPrice:
                  product.old_price != null
                    ? Number(
                        product.old_price
                      )
                    : null,

                image:
                  getProductImageUrl(
                    primaryImage?.storage_path
                  ),

                rating:
                  Number(product.rating) || 0,

                description:
                  product.description || "",

                stockQuantity:
                  Number(
                    product.stock_quantity
                  ) || 0,

                slug:
                  product.slug || "",
              };
            }
          );

        setProducts(mappedProducts);
      } catch (err) {
        console.error(
          "Failed to load products:",
          err
        );

        setError(
          err.message ||
            "Unable to load products"
        );
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);


  /* =========================================
     ADD TO CART - BACKEND
  ========================================== */

  const handleAddToCart = async (product) => {
    try {
      setAddingProductId(product.id);

      /* -------------------------------------
         CHECK SUPABASE LOGIN
      ------------------------------------- */

      const {
        data: sessionData,
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw new Error(
          "Unable to verify your login"
        );
      }

      const session =
        sessionData?.session;

      if (!session) {
        navigate("/login");
        return;
      }


      /* -------------------------------------
         ADD PRODUCT TO BACKEND CART
      ------------------------------------- */

      const response = await fetch(
        `${API_URL}/api/cart`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${session.access_token}`,
          },

          body: JSON.stringify({
            product_id: product.id,
            quantity: 1,
          }),
        }
      );

      const result =
        await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Unable to add product to cart"
        );
      }


      /* -------------------------------------
         UPDATE UI
      ------------------------------------- */

      setAddedProductIds((current) => {
        if (
          current.includes(product.id)
        ) {
          return current;
        }

        return [
          ...current,
          product.id,
        ];
      });


      /* -------------------------------------
         NOTIFY NAVBAR / CART
      ------------------------------------- */

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


      /* -------------------------------------
         RESET BUTTON AFTER SHORT DELAY
      ------------------------------------- */

      setTimeout(() => {
        setAddedProductIds((current) =>
          current.filter(
            (id) => id !== product.id
          )
        );
      }, 1500);

    } catch (err) {
      console.error(
        "Add to cart error:",
        err
      );

      alert(
        err.message ||
          "Unable to add product to cart"
      );
    } finally {
      setAddingProductId(null);
    }
  };


  /* =========================================
     LOADING STATE
  ========================================== */

  if (loading) {
    return (
      <main className="shop-page">

        <div className="shop-container">

          <div className="shop-loading">
            Loading products...
          </div>

        </div>

      </main>
    );
  }


  /* =========================================
     ERROR STATE
  ========================================== */

  if (error) {
    return (
      <main className="shop-page">

        <div className="shop-container">

          <div className="shop-error">

            <h2>
              Unable to Load Products
            </h2>

            <p>
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                window.location.reload()
              }
            >
              Try Again
            </button>

          </div>

        </div>

      </main>
    );
  }


  /* =========================================
     MAIN UI
  ========================================== */

  return (
    <main className="shop-page">

      <div className="shop-container">

        {/* ===================================
            SHOP HEADER
        ==================================== */}

        <div className="shop-header">

          <p className="shop-eyebrow">
            BEE PURE
          </p>

          <h1>
            Shop Our Products
          </h1>

          <p className="shop-description">
            Discover pure, natural and
            organic products sourced
            directly from farmers.
          </p>

        </div>


        {/* ===================================
            PRODUCT COUNT
        ==================================== */}

        <div className="shop-results-info">

          <span>
            {products.length}{" "}
            {products.length === 1
              ? "product"
              : "products"}
          </span>

        </div>


        {/* ===================================
            PRODUCT GRID
        ==================================== */}

        {products.length > 0 ? (

          <div className="shop-product-grid">

            {products.map((product) => {

              const isAdding =
                addingProductId ===
                product.id;

              const isAdded =
                addedProductIds.includes(
                  product.id
                );

              return (
                <article
                  className="shop-product-card"
                  key={product.id}
                >

                  {/* PRODUCT IMAGE */}

                  <Link
                    to={`/product/${product.id}`}
                    className="shop-product-image"
                  >

                    {product.image ? (

                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        onError={(event) => {
                          console.error(
                            "Shop image failed to load:",
                            event
                              .currentTarget
                              .src
                          );
                        }}
                      />

                    ) : (

                      <div className="shop-image-placeholder">
                        No Image
                      </div>

                    )}

                    {product.oldPrice && (
                      <span className="shop-sale-badge">
                        SALE
                      </span>
                    )}

                  </Link>


                  {/* PRODUCT CONTENT */}

                  <div className="shop-product-content">

                    {/* CATEGORY */}

                    <p className="shop-product-category">
                      {product.category}
                    </p>


                    {/* PRODUCT NAME */}

                    <Link
                      to={`/product/${product.id}`}
                      className="shop-product-name"
                    >
                      {product.name}
                    </Link>


                    {/* RATING */}

                    <div className="shop-product-rating">

                      <span className="stars">
                        {"★".repeat(
                          Math.round(
                            product.rating
                          )
                        )}
                      </span>

                      <small>
                        {product.rating}
                      </small>

                    </div>


                    {/* PRICE */}

                    <div className="shop-price">

                      <strong>
                        ₹{product.price}
                      </strong>

                      {product.oldPrice && (
                        <del>
                          ₹
                          {
                            product.oldPrice
                          }
                        </del>
                      )}

                    </div>


                    {/* FARMER */}

                    {product.farmer && (
                      <p className="shop-product-farmer">
                        From{" "}
                        {product.farmer}
                      </p>
                    )}


                    {/* ADD TO CART */}

                    <button
                      type="button"
                      className={`shop-add-cart ${
                        isAdded
                          ? "added"
                          : ""
                      }`}
                      onClick={() =>
                        handleAddToCart(
                          product
                        )
                      }
                      disabled={
                        product.stockQuantity <=
                          0 ||
                        isAdding ||
                        isAdded
                      }
                    >

                      {isAdding ? (

                        <>
                          <Loader2
                            size={16}
                            className="spin"
                          />

                          Adding...
                        </>

                      ) : isAdded ? (

                        <>
                          <Check
                            size={16}
                          />

                          Added
                        </>

                      ) : product.stockQuantity <=
                        0 ? (

                        "Out of Stock"

                      ) : (

                        <>
                          <ShoppingCart
                            size={17}
                          />

                          Add to Cart
                        </>

                      )}

                    </button>

                  </div>

                </article>
              );
            })}

          </div>

        ) : (

          /* =================================
             EMPTY STATE
          ================================== */

          <div className="shop-empty">

            <h2>
              No Products Available
            </h2>

            <p>
              There are currently no
              products available.
            </p>

          </div>

        )}

      </div>

    </main>
  );
}

export default Shop;