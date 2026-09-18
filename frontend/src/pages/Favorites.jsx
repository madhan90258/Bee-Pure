import { useEffect, useState } from "react";

import {
  Heart,
  ShoppingCart,
  ArrowLeft,
  Loader2,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { supabase } from "../lib/supabase";

import {
  getFavorites,
  removeFromFavorites,
} from "../utils/favorites";

import "../styles/Favorites.css";


function Favorites() {
  const navigate = useNavigate();

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [error, setError] = useState("");


  // =========================================
  // LOAD FAVORITES
  // =========================================

  const loadFavorites = async () => {
    try {
      setLoading(true);
      setError("");

      const {
        data: sessionData,
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      const session = sessionData?.session;

      if (!session) {
        setFavorites([]);
        setLoading(false);
        return;
      }

      const data = await getFavorites();

      setFavorites(
        Array.isArray(data) ? data : []
      );

    } catch (err) {
      console.error(
        "Failed to load favorites:",
        err
      );

      setFavorites([]);

      setError(
        err.message ||
          "Unable to load your favorites."
      );
    } finally {
      setLoading(false);
    }
  };


  // =========================================
  // INITIAL LOAD
  // =========================================

  useEffect(() => {
    loadFavorites();

    const handleFavoritesUpdate = () => {
      loadFavorites();
    };

    window.addEventListener(
      "favoritesUpdated",
      handleFavoritesUpdate
    );

    window.addEventListener(
      "storage",
      handleFavoritesUpdate
    );

    return () => {
      window.removeEventListener(
        "favoritesUpdated",
        handleFavoritesUpdate
      );

      window.removeEventListener(
        "storage",
        handleFavoritesUpdate
      );
    };
  }, []);


  // =========================================
  // AUTH STATE CHANGE
  // =========================================

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      () => {
        loadFavorites();
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);


  // =========================================
  // REMOVE FAVORITE
  // =========================================

  const handleRemove = async (productId) => {
    try {
      setRemovingId(productId);
      setError("");

      await removeFromFavorites(productId);

      setFavorites(
        (currentFavorites) =>
          currentFavorites.filter(
            (product) =>
              String(product.id) !==
              String(productId)
          )
      );

      window.dispatchEvent(
        new Event("favoritesUpdated")
      );

    } catch (err) {
      console.error(
        "Remove favorite error:",
        err
      );

      setError(
        err.message ||
          "Unable to remove favorite."
      );
    } finally {
      setRemovingId(null);
    }
  };


  // =========================================
  // LOADING
  // =========================================

  if (loading) {
    return (
      <main className="favorites-page">

        <div className="favorites-empty">

          <div className="favorites-empty-icon">
            <Loader2
              size={34}
              className="favorites-spinner"
            />
          </div>

          <h1>
            Loading Favorites...
          </h1>

          <p>
            Please wait while we load your
            saved products.
          </p>

        </div>

      </main>
    );
  }


  // =========================================
  // LOGIN REQUIRED
  // =========================================

  const hasLoginError =
    error &&
    (
      error.toLowerCase().includes("login") ||
      error.toLowerCase().includes("unauthorized") ||
      error.toLowerCase().includes("authentication")
    );

  if (hasLoginError) {
    return (
      <main className="favorites-page">

        <div className="favorites-empty">

          <div className="favorites-empty-icon">
            <Heart size={34} />
          </div>

          <h1>
            Login to View Favorites
          </h1>

          <p>
            Please login to save and view
            your favorite Bee Pure products.
          </p>

          <Link
            to="/login"
            className="favorites-shop-button"
          >
            Login
          </Link>

        </div>

      </main>
    );
  }


  // =========================================
  // ERROR
  // =========================================

  if (error) {
    return (
      <main className="favorites-page">

        <div className="favorites-empty">

          <div className="favorites-empty-icon">
            <Heart size={34} />
          </div>

          <h1>
            Unable to Load Favorites
          </h1>

          <p>
            {error}
          </p>

          <button
            type="button"
            className="favorites-shop-button"
            onClick={loadFavorites}
          >
            Try Again
          </button>

        </div>

      </main>
    );
  }


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

          {favorites.map((product) => {

            const isRemoving =
              String(removingId) ===
              String(product.id);

            return (
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
                      src={
                        product.image ||
                        "/products/img1.png"
                      }
                      alt={
                        product.name ||
                        "Bee Pure product"
                      }
                      loading="lazy"
                    />
                  </Link>

                  <button
                    type="button"
                    className="favorite-remove"
                    onClick={() =>
                      handleRemove(product.id)
                    }
                    disabled={isRemoving}
                    aria-label={
                      `Remove ${
                        product.name
                      } from favorites`
                    }
                  >

                    {isRemoving ? (
                      <Loader2
                        size={18}
                        className="favorites-spinner"
                      />
                    ) : (
                      <Heart
                        size={18}
                        fill="currentColor"
                      />
                    )}

                  </button>

                </div>


                {/* CONTENT */}

                <div className="favorite-content">

                  <span className="favorite-category">
                    {product.category ||
                      "Bee Pure"}
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
                      {"★".repeat(
                        Math.max(
                          0,
                          Math.min(
                            5,
                            Math.round(
                              Number(
                                product.rating || 0
                              )
                            )
                          )
                        )
                      )}
                    </span>

                    <small>
                      {Number(
                        product.rating || 0
                      ).toFixed(1)}{" "}
                      / 5
                    </small>

                  </div>


                  {/* PRICE */}

                  <div className="favorite-price">

                    <strong>
                      ₹
                      {Number(
                        product.price || 0
                      ).toLocaleString("en-IN")}
                    </strong>

                    {product.oldPrice && (
                      <del>
                        ₹
                        {Number(
                          product.oldPrice
                        ).toLocaleString(
                          "en-IN"
                        )}
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
            );
          })}

        </div>

      </div>

    </main>
  );
}

export default Favorites;