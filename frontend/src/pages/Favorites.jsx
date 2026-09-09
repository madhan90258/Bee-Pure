import { useEffect, useState } from "react";

import {
  Heart,
  ShoppingCart,
  ArrowLeft,
} from "lucide-react";

import { Link } from "react-router-dom";

import {
  getFavorites,
  removeFromFavorites,
} from "../utils/favorites";

import "../styles/Favorites.css";

function Favorites() {
  const [favorites, setFavorites] =
    useState([]);

  // =========================================
  // LOAD FAVORITES
  // =========================================

  const loadFavorites = () => {
    setFavorites(getFavorites());
  };

  useEffect(() => {
    loadFavorites();

    const handleFavoritesUpdate = () => {
      loadFavorites();
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
  }, []);

  // =========================================
  // REMOVE FAVORITE
  // =========================================

  const handleRemove = (productId) => {
    const updatedFavorites =
      removeFromFavorites(productId);

    setFavorites(updatedFavorites);
  };

  // =========================================
  // EMPTY
  // =========================================

  if (favorites.length === 0) {
    return (
      <main className="favorites-page">

        <div className="favorites-empty">

          <div className="favorites-empty-icon">
            <Heart size={34} />
          </div>

          <h1>
            Your Favorites are Empty
          </h1>

          <p>
            Save the products you love and
            come back to them anytime.
          </p>

          <Link
            to="/shop"
            className="favorites-shop-button"
          >
            Explore Products
          </Link>

        </div>

      </main>
    );
  }

  // =========================================
  // PAGE
  // =========================================

  return (
    <main className="favorites-page">

      <div className="favorites-container">

        {/* HEADER */}

        <div className="favorites-header">

          <div>

            <p className="favorites-eyebrow">
              YOUR BEE PURE FAVORITES
            </p>

            <h1>
              My Favorites
            </h1>

            <p>
              Products you've saved for later.
            </p>

          </div>

          <Link
            to="/shop"
            className="favorites-continue"
          >
            <ArrowLeft size={16} />
            Continue Shopping
          </Link>

        </div>


        {/* PRODUCTS */}

        <div className="favorites-grid">

          {favorites.map((product) => (

            <article
              className="favorite-card"
              key={product.id}
            >

              {/* IMAGE */}

              <div className="favorite-image">

                <Link
                  to={`/product/${product.id}`}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                  />
                </Link>

                <button
                  type="button"
                  className="favorite-remove"
                  onClick={() =>
                    handleRemove(product.id)
                  }
                  aria-label={`Remove ${product.name} from favorites`}
                >
                  <Heart
                    size={18}
                    fill="currentColor"
                  />
                </button>

              </div>


              {/* CONTENT */}

              <div className="favorite-content">

                <span className="favorite-category">
                  {product.category}
                </span>

                <Link
                  to={`/product/${product.id}`}
                  className="favorite-name"
                >
                  {product.name}
                </Link>


                {/* RATING */}

                <div className="favorite-rating">

                  <span>
                    {"★".repeat(product.rating)}
                  </span>

                  <small>
                    {product.rating}.0 / 5
                  </small>

                </div>


                {/* PRICE */}

                <div className="favorite-price">

                  <strong>
                    ₹{product.price}
                  </strong>

                  {product.oldPrice && (
                    <del>
                      ₹{product.oldPrice}
                    </del>
                  )}

                </div>


                {/* VIEW PRODUCT */}

                <Link
                  to={`/product/${product.id}`}
                  className="favorite-cart-button"
                >
                  <ShoppingCart size={16} />
                  View Product
                </Link>

              </div>

            </article>

          ))}

        </div>

      </div>

    </main>
  );
}

export default Favorites;