import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  ShoppingCart,
  Search,
  SlidersHorizontal,
  X,
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

  // If the database already contains a full URL
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
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] =
    useState("");

  const [selectedCategory, setSelectedCategory] =
    useState("");

  const [selectedFarmer, setSelectedFarmer] =
    useState("");

  const [sortBy, setSortBy] =
    useState("newest");

  const [showFilters, setShowFilters] =
    useState(false);

  const [categories, setCategories] =
    useState([]);

  const [farmers, setFarmers] =
    useState([]);

  /* =========================================
     LOAD PRODUCTS
  ========================================== */

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/products?limit=100`
        );

        const result =
          await response.json();

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

                categoryId:
                  product.category_id,

                farmer:
                  product.farmers?.name ||
                  "",

                farmerId:
                  product.farmer_id,

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
                  Number(product.rating) ||
                  0,

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
     LOAD CATEGORIES
  ========================================== */

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/categories`
        );

        const result =
          await response.json();

        if (
          response.ok &&
          result.success
        ) {
          setCategories(
            result.categories || []
          );
        }
      } catch (error) {
        console.error(
          "Failed to load categories:",
          error
        );
      }
    };

    loadCategories();
  }, []);


  /* =========================================
     LOAD FARMERS
  ========================================== */

  useEffect(() => {
    const loadFarmers = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/farmers`
        );

        const result =
          await response.json();

        if (
          response.ok &&
          result.success
        ) {
          setFarmers(
            result.farmers || []
          );
        }
      } catch (error) {
        console.error(
          "Failed to load farmers:",
          error
        );
      }
    };

    loadFarmers();
  }, []);


  /* =========================================
     FILTER + SORT PRODUCTS
  ========================================== */

  const filteredProducts =
    products
      .filter((product) => {
        const search =
          searchTerm
            .trim()
            .toLowerCase();

        if (!search) {
          return true;
        }

        return (
          product.name
            .toLowerCase()
            .includes(search) ||
          product.category
            .toLowerCase()
            .includes(search) ||
          product.farmer
            .toLowerCase()
            .includes(search)
        );
      })
      .filter((product) => {
        if (!selectedCategory) {
          return true;
        }

        return (
          String(product.categoryId) ===
          String(selectedCategory)
        );
      })
      .filter((product) => {
        if (!selectedFarmer) {
          return true;
        }

        return (
          String(product.farmerId) ===
          String(selectedFarmer)
        );
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "price-low":
            return a.price - b.price;

          case "price-high":
            return b.price - a.price;

          case "rating":
            return b.rating - a.rating;

          case "name":
            return a.name.localeCompare(
              b.name
            );

          case "newest":
          default:
            return 0;
        }
      });


  /* =========================================
     ADD TO CART
  ========================================== */

  const handleAddToCart = (product) => {
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
                    (cartProduct.quantity ||
                      0) + 1,
                }
              : cartProduct
        );
    } else {
      updatedCart = [
        ...savedCart,

        {
          ...product,
          quantity: 1,
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
     CLEAR FILTERS
  ========================================== */

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedFarmer("");
    setSortBy("newest");
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

          <div>

            <p className="shop-eyebrow">
              BEE PURE
            </p>

            <h1>
              Shop Our Products
            </h1>

            <p>
              Discover pure, natural and
              organic products sourced
              directly from farmers.
            </p>

          </div>

        </div>


        {/* ===================================
            SEARCH + FILTER BAR
        ==================================== */}

        <div className="shop-toolbar">

          {/* SEARCH */}

          <div className="shop-search">

            <Search size={18} />

            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value
                )
              }
            />

            {searchTerm && (

              <button
                type="button"
                onClick={() =>
                  setSearchTerm("")
                }
                aria-label="Clear search"
              >
                <X size={16} />
              </button>

            )}

          </div>


          {/* FILTER BUTTON */}

          <button
            type="button"
            className="shop-filter-button"
            onClick={() =>
              setShowFilters(
                !showFilters
              )
            }
          >
            <SlidersHorizontal
              size={18}
            />

            Filters
          </button>


          {/* SORT */}

          <select
            className="shop-sort"
            value={sortBy}
            onChange={(event) =>
              setSortBy(
                event.target.value
              )
            }
          >

            <option value="newest">
              Newest
            </option>

            <option value="price-low">
              Price: Low to High
            </option>

            <option value="price-high">
              Price: High to Low
            </option>

            <option value="rating">
              Top Rated
            </option>

            <option value="name">
              Name
            </option>

          </select>

        </div>


        {/* ===================================
            FILTER PANEL
        ==================================== */}

        {showFilters && (

          <div className="shop-filter-panel">

            {/* CATEGORY */}

            <div className="shop-filter-group">

              <label>
                Category
              </label>

              <select
                value={
                  selectedCategory
                }
                onChange={(event) =>
                  setSelectedCategory(
                    event.target.value
                  )
                }
              >

                <option value="">
                  All Categories
                </option>

                {categories.map(
                  (category) => (

                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>

                  )
                )}

              </select>

            </div>


            {/* FARMER */}

            <div className="shop-filter-group">

              <label>
                Farmer
              </label>

              <select
                value={
                  selectedFarmer
                }
                onChange={(event) =>
                  setSelectedFarmer(
                    event.target.value
                  )
                }
              >

                <option value="">
                  All Farmers
                </option>

                {farmers.map(
                  (farmer) => (

                    <option
                      key={farmer.id}
                      value={farmer.id}
                    >
                      {farmer.name}
                    </option>

                  )
                )}

              </select>

            </div>


            {/* CLEAR */}

            <button
              type="button"
              className="shop-clear-filters"
              onClick={
                clearFilters
              }
            >
              Clear Filters
            </button>

          </div>

        )}


        {/* ===================================
            RESULT COUNT
        ==================================== */}

        <div className="shop-results-info">

          <span>
            {filteredProducts.length}{" "}
            {filteredProducts.length ===
            1
              ? "product"
              : "products"}
          </span>

        </div>


        {/* ===================================
            PRODUCT GRID
        ==================================== */}

        {filteredProducts.length >
        0 ? (

          <div className="shop-product-grid">

            {filteredProducts.map(
              (product) => (

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

                    <p className="shop-product-category">
                      {product.category}
                    </p>


                    <Link
                      to={`/product/${product.id}`}
                      className="shop-product-name"
                    >
                      {product.name}
                    </Link>


                    {/* RATING */}

                    <div className="shop-product-rating">

                      <span>
                        {"★".repeat(
                          product.rating
                        )}
                      </span>

                      <small>
                        {product.rating}
                      </small>

                    </div>


                    {/* PRICE */}

                    <div className="shop-product-price">

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
                      className="shop-add-cart"
                      onClick={() =>
                        handleAddToCart(
                          product
                        )
                      }
                      disabled={
                        product.stockQuantity <=
                        0
                      }
                    >

                      <ShoppingCart
                        size={17}
                      />

                      {product.stockQuantity <=
                      0
                        ? "Out of Stock"
                        : "Add to Cart"}

                    </button>

                  </div>

                </article>

              )
            )}

          </div>

        ) : (

          /* =================================
             EMPTY STATE
          ================================== */

          <div className="shop-empty">

            <h2>
              No Products Found
            </h2>

            <p>
              Try changing your search
              or filters.
            </p>

            <button
              type="button"
              onClick={
                clearFilters
              }
            >
              Clear Filters
            </button>

          </div>

        )}

      </div>

    </main>
  );
}

export default Shop;