import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ShoppingCart,
  ArrowRight,
  Check,
  Minus,
  Plus,
} from "lucide-react";

import {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart,
} from "../utils/cart";

import "../styles/Shop.css";

function Shop() {
  const [cart, setCart] = useState([]);
  const [addedProduct, setAddedProduct] = useState(null);

  // =========================================
  // SEARCH PARAMETER
  // =========================================

  const [searchParams] = useSearchParams();

  const searchQuery = searchParams.get("search") || "";

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
  // SEARCH FILTER
  // =========================================

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    // No search = show all products
    if (!query) {
      return products;
    }

    return products.filter((product) => {
      const name = product.name.toLowerCase();
      const category = product.category.toLowerCase();
      const description = product.description.toLowerCase();

      return (
        name.includes(query) ||
        category.includes(query) ||
        description.includes(query)
      );
    });
  }, [searchQuery]);

  // =========================================
  // LOAD CART
  // =========================================

  useEffect(() => {
    const loadCart = () => {
      setCart(getCart());
    };

    loadCart();

    window.addEventListener("cartUpdated", loadCart);

    return () => {
      window.removeEventListener("cartUpdated", loadCart);
    };
  }, []);

  // =========================================
  // GET PRODUCT QUANTITY
  // =========================================

  const getProductQuantity = (productId) => {
    const item = cart.find(
      (item) => item.id === productId
    );

    return item ? item.quantity : 0;
  };

  // =========================================
  // ADD TO CART
  // =========================================

  const handleAddToCart = (product) => {
    const updatedCart = addToCart(product);

    setCart(updatedCart);

    setAddedProduct(product.id);

    setTimeout(() => {
      setAddedProduct(null);
    }, 1000);
  };

  // =========================================
  // INCREASE QUANTITY
  // =========================================

  const handleIncrease = (product) => {
    const currentQuantity = getProductQuantity(product.id);

    const updatedCart = updateCartQuantity(
      product.id,
      currentQuantity + 1
    );

    setCart(updatedCart);
  };

  // =========================================
  // DECREASE QUANTITY
  // =========================================

  const handleDecrease = (product) => {
    const currentQuantity = getProductQuantity(product.id);

    if (currentQuantity <= 1) {
      const updatedCart = removeFromCart(product.id);

      setCart(updatedCart);

      return;
    }

    const updatedCart = updateCartQuantity(
      product.id,
      currentQuantity - 1
    );

    setCart(updatedCart);
  };

  return (
    <main className="shop-page">

      {/* =========================================
          SHOP HEADER
      ========================================= */}

      <section className="shop-header-section">

        <div className="shop-container">

          <div className="shop-header">

            <p className="shop-eyebrow">
              BEE PURE COLLECTION
            </p>

            <h1>
              Pure Products,
              <br />
              <span>Straight From Nature.</span>
            </h1>

            <p className="shop-description">
              Discover naturally good products sourced
              directly from trusted local farmers.
            </p>

          </div>

        </div>

      </section>


      {/* =========================================
          PRODUCTS SECTION
      ========================================= */}

      <section className="shop-products-section">

        <div className="shop-container">

          {/* CATEGORY FILTER */}

          <div className="shop-toolbar">

            <div className="shop-categories">

              <button
                type="button"
                className="shop-category active"
              >
                All Products
              </button>

              <button
                type="button"
                className="shop-category"
              >
                Honey
              </button>

              <button
                type="button"
                className="shop-category"
              >
                Natural Sweeteners
              </button>

              <button
                type="button"
                className="shop-category"
              >
                Healthy Foods
              </button>

              <button
                type="button"
                className="shop-category"
              >
                Wellness
              </button>

            </div>

            <p className="shop-product-count">
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1
                ? "product"
                : "products"}
            </p>

          </div>


          {/* =========================================
              SEARCH RESULTS MESSAGE
          ========================================= */}

          {searchQuery.trim() && (
            <div className="shop-search-result">

              <p>
                Search results for{" "}
                <strong>
                  "{searchQuery}"
                </strong>
              </p>

            </div>
          )}


          {/* =========================================
              PRODUCT GRID
          ========================================= */}

          {filteredProducts.length > 0 ? (

            <div className="shop-product-grid">

              {filteredProducts.map((product) => {

                const quantity =
                  getProductQuantity(product.id);

                const isAdded =
                  addedProduct === product.id;

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

                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                      />

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

                        <span className="stars">
                          {"★".repeat(product.rating)}
                        </span>

                        <span>
                          ({product.rating}.0)
                        </span>

                      </div>


                      {/* PRICE + CART */}

                      <div className="shop-product-bottom">

                        <div className="shop-price">

                          <strong>
                            ₹{product.price}
                          </strong>

                          {product.oldPrice && (
                            <del>
                              ₹{product.oldPrice}
                            </del>
                          )}

                        </div>


                        {/* CART BUTTON */}

                        {quantity === 0 ? (

                          <button
                            type="button"
                            className={`shop-add-cart ${
                              isAdded ? "added" : ""
                            }`}
                            onClick={() =>
                              handleAddToCart(product)
                            }
                            aria-label={`Add ${product.name} to cart`}
                          >

                            {isAdded ? (
                              <>
                                <Check size={17} />
                                <span>Added</span>
                              </>
                            ) : (
                              <>
                                <ShoppingCart size={17} />
                                <span>
                                  Add to Cart
                                </span>
                              </>
                            )}

                          </button>

                        ) : (

                          <div
                            className="shop-quantity-control"
                            aria-label={`Quantity of ${product.name}`}
                          >

                            <button
                              type="button"
                              className="shop-quantity-btn"
                              onClick={() =>
                                handleDecrease(product)
                              }
                              aria-label={`Decrease ${product.name} quantity`}
                            >
                              <Minus size={15} />
                            </button>

                            <span className="shop-quantity">
                              {quantity}
                            </span>

                            <button
                              type="button"
                              className="shop-quantity-btn"
                              onClick={() =>
                                handleIncrease(product)
                              }
                              aria-label={`Increase ${product.name} quantity`}
                            >
                              <Plus size={15} />
                            </button>

                          </div>

                        )}

                      </div>

                    </div>

                  </article>
                );
              })}

            </div>

          ) : (

            /* =========================================
               NO SEARCH RESULTS
            ========================================= */

            <div className="shop-no-results">

              <h2>
                No products found
              </h2>

              <p>
                We couldn't find any products matching{" "}
                <strong>
                  "{searchQuery}"
                </strong>.
              </p>

              <Link
                to="/shop"
                className="shop-no-results-button"
              >
                View All Products
              </Link>

            </div>

          )}


          {/* =========================================
              BOTTOM MESSAGE
          ========================================= */}

          <div className="shop-bottom-message">

            <p>
              More naturally good products are coming soon.
            </p>

            <Link to="/">
              Back to Home
              <ArrowRight size={16} />
            </Link>

          </div>

        </div>

      </section>

    </main>
  );
}

export default Shop;