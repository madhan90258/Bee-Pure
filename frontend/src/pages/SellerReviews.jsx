import { useEffect, useMemo, useState } from "react";

import {
  Star,
  Trash2,
  Eye,
  EyeOff,
  Search,
  X,
  RefreshCw,
} from "lucide-react";

import { supabase } from "../lib/supabase";

import "../styles/SellerReviews.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

function SellerReviews() {
  const [reviews, setReviews] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [selectedReview, setSelectedReview] =
    useState(null);

  const [stats, setStats] =
    useState({
      total_reviews: 0,
      visible_reviews: 0,
      average_rating: 0,
    });

  /*
  |--------------------------------------------------------------------------
  | GET SESSION
  |--------------------------------------------------------------------------
  */

  const getSession = async () => {
    const {
      data: {
        session,
      },
      error: sessionError,
    } =
      await supabase.auth.getSession();

    if (sessionError) {
      throw new Error(
        sessionError.message
      );
    }

    if (
      !session?.access_token
    ) {
      throw new Error(
        "Authentication required"
      );
    }

    return session;
  };

  /*
  |--------------------------------------------------------------------------
  | LOAD REVIEWS
  |--------------------------------------------------------------------------
  */

  const loadReviews = async (
    showRefresh = false
  ) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const session =
        await getSession();

      const response =
        await fetch(
          `${API_URL}/api/seller/reviews`,
          {
            method: "GET",

            headers: {
              Authorization:
                `Bearer ${session.access_token}`,

              "Content-Type":
                "application/json",
            },
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load reviews"
        );
      }

      setReviews(
        data.reviews || []
      );

      setStats(
        data.stats || {
          total_reviews: 0,
          visible_reviews: 0,
          average_rating: 0,
        }
      );
    } catch (err) {
      console.error(
        "Load reviews error:",
        err
      );

      setError(
        err.message ||
          "Failed to load reviews"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | INITIAL LOAD
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    loadReviews();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | SUCCESS MESSAGE
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!success) {
      return;
    }

    const timer =
      setTimeout(() => {
        setSuccess("");
      }, 3000);

    return () =>
      clearTimeout(timer);
  }, [success]);

  /*
  |--------------------------------------------------------------------------
  | UPDATE VISIBILITY
  |--------------------------------------------------------------------------
  */

  const handleToggleVisibility =
    async (review) => {
      try {
        setError("");

        const session =
          await getSession();

        const response =
          await fetch(
            `${API_URL}/api/seller/reviews/${review.id}/visibility`,
            {
              method: "PATCH",

              headers: {
                Authorization:
                  `Bearer ${session.access_token}`,

                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                is_approved:
                  !review.visible,
              }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to update review"
          );
        }

        const updatedReview =
          data.review;

        setReviews(
          (previousReviews) =>
            previousReviews.map(
              (item) =>
                item.id ===
                review.id
                  ? updatedReview
                  : item
            )
        );

        setSelectedReview(
          (current) => {
            if (
              !current ||
              current.id !==
                review.id
            ) {
              return current;
            }

            return updatedReview;
          }
        );

        /*
        |--------------------------------------------------------------------------
        | Update statistics locally
        |--------------------------------------------------------------------------
        */

        setStats(
          (previousStats) => ({
            ...previousStats,

            visible_reviews:
              updatedReview.visible
                ? previousStats.visible_reviews +
                  1
                : Math.max(
                    previousStats.visible_reviews -
                      1,
                    0
                  ),
          })
        );

        setSuccess(
          updatedReview.visible
            ? "Review is now visible"
            : "Review has been hidden"
        );
      } catch (err) {
        console.error(
          "Update review error:",
          err
        );

        setError(
          err.message ||
            "Failed to update review"
        );
      }
    };

  /*
  |--------------------------------------------------------------------------
  | DELETE REVIEW
  |--------------------------------------------------------------------------
  */

  const handleDelete =
    async (reviewId) => {
      const confirmed =
        window.confirm(
          "Are you sure you want to permanently delete this review?"
        );

      if (!confirmed) {
        return;
      }

      try {
        setError("");

        const session =
          await getSession();

        const response =
          await fetch(
            `${API_URL}/api/seller/reviews/${reviewId}`,
            {
              method: "DELETE",

              headers: {
                Authorization:
                  `Bearer ${session.access_token}`,

                "Content-Type":
                  "application/json",
              },
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to delete review"
          );
        }

        setReviews(
          (previousReviews) =>
            previousReviews.filter(
              (review) =>
                review.id !==
                reviewId
            )
        );

        if (
          selectedReview?.id ===
          reviewId
        ) {
          setSelectedReview(
            null
          );
        }

        /*
        |--------------------------------------------------------------------------
        | Recalculate statistics
        |--------------------------------------------------------------------------
        */

        setStats(
          (previousStats) => {
            const deletedReview =
              reviews.find(
                (review) =>
                  review.id ===
                  reviewId
              );

            const newTotal =
              Math.max(
                previousStats.total_reviews -
                  1,
                0
              );

            const newVisible =
              deletedReview?.visible
                ? Math.max(
                    previousStats.visible_reviews -
                      1,
                    0
                  )
                : previousStats.visible_reviews;

            return {
              ...previousStats,
              total_reviews:
                newTotal,
              visible_reviews:
                newVisible,
            };
          }
        );

        setSuccess(
          "Review deleted successfully"
        );
      } catch (err) {
        console.error(
          "Delete review error:",
          err
        );

        setError(
          err.message ||
            "Failed to delete review"
        );
      }
    };

  /*
  |--------------------------------------------------------------------------
  | SEARCH
  |--------------------------------------------------------------------------
  */

  const filteredReviews =
    useMemo(() => {
      const query =
        search
          .toLowerCase()
          .trim();

      if (!query) {
        return reviews;
      }

      return reviews.filter(
        (review) =>
          String(
            review.product || ""
          )
            .toLowerCase()
            .includes(query) ||
          String(
            review.customer || ""
          )
            .toLowerCase()
            .includes(query) ||
          String(
            review.email || ""
          )
            .toLowerCase()
            .includes(query) ||
          String(
            review.review || ""
          )
            .toLowerCase()
            .includes(query)
      );
    }, [
      reviews,
      search,
    ]);

  /*
  |--------------------------------------------------------------------------
  | DATE
  |--------------------------------------------------------------------------
  */

  const formatDate = (
    dateString
  ) => {
    if (!dateString) {
      return "-";
    }

    const date =
      new Date(dateString);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "-";
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  /*
  |--------------------------------------------------------------------------
  | STARS
  |--------------------------------------------------------------------------
  */

  const renderStars = (
    rating
  ) => {
    return (
      <div className="seller-review-stars">
        {[1, 2, 3, 4, 5].map(
          (star) => (
            <Star
              key={star}
              size={15}
              fill={
                star <=
                Number(rating)
                  ? "currentColor"
                  : "none"
              }
            />
          )
        )}
      </div>
    );
  };

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <main className="seller-reviews-page">
        <div className="seller-reviews-container">
          <div className="seller-reviews-empty">
            <RefreshCw
              size={30}
              className="seller-reviews-spinner"
            />

            <h3>
              Loading reviews...
            </h3>
          </div>
        </div>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <main className="seller-reviews-page">
      <div className="seller-reviews-container">

        {/* Header */}

        <div className="seller-reviews-header">

          <div>
            <p className="seller-reviews-eyebrow">
              Seller Panel
            </p>

            <h1>
              Customer Reviews
            </h1>

            <p className="seller-reviews-subtitle">
              View and manage reviews
              submitted by your
              customers.
            </p>
          </div>

          <button
            type="button"
            className="seller-reviews-refresh-btn"
            onClick={() =>
              loadReviews(true)
            }
            disabled={refreshing}
          >
            <RefreshCw
              size={16}
              className={
                refreshing
                  ? "seller-reviews-spinner"
                  : ""
              }
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>

        </div>

        {/* Error */}

        {error && (
          <div className="seller-reviews-alert seller-reviews-error">
            {error}
          </div>
        )}

        {/* Success */}

        {success && (
          <div className="seller-reviews-alert seller-reviews-success">
            {success}
          </div>
        )}

        {/* Stats */}

        <div className="seller-review-stats">

          <div className="seller-review-stat-card">
            <span>
              Total Reviews
            </span>

            <strong>
              {stats.total_reviews}
            </strong>
          </div>

          <div className="seller-review-stat-card">
            <span>
              Visible Reviews
            </span>

            <strong>
              {stats.visible_reviews}
            </strong>
          </div>

          <div className="seller-review-stat-card">
            <span>
              Average Rating
            </span>

            <strong>
              {Number(
                stats.average_rating || 0
              ).toFixed(1)}

              <span className="rating-small">
                / 5
              </span>
            </strong>
          </div>

        </div>

        {/* Toolbar */}

        <div className="seller-reviews-toolbar">

          <div className="seller-review-search">

            <Search size={18} />

            <input
              type="search"
              placeholder="Search reviews, customers or products..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />

            {search && (
              <button
                type="button"
                onClick={() =>
                  setSearch("")
                }
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}

          </div>

          <span className="seller-review-result-count">
            {filteredReviews.length} review
            {filteredReviews.length !==
            1
              ? "s"
              : ""}
          </span>

        </div>

        {/* Reviews */}

        <div className="seller-reviews-list">

          {filteredReviews.length ===
          0 ? (
            <div className="seller-reviews-empty">

              <Star size={38} />

              <h3>
                {reviews.length ===
                0
                  ? "No reviews yet"
                  : "No reviews found"}
              </h3>

              <p>
                {reviews.length ===
                0
                  ? "Customer reviews will appear here."
                  : "Try searching with another product or customer name."}
              </p>

            </div>
          ) : (
            filteredReviews.map(
              (review) => (
                <article
                  className={`seller-review-card ${
                    !review.visible
                      ? "review-hidden"
                      : ""
                  }`}
                  key={review.id}
                >

                  {/* Product */}

                  <div className="seller-review-product">

                    <span className="seller-review-label">
                      PRODUCT
                    </span>

                    <strong>
                      {review.product}
                    </strong>

                  </div>

                  {/* Customer */}

                  <div className="seller-review-customer">

                    <span className="seller-review-label">
                      CUSTOMER
                    </span>

                    <strong>
                      {review.customer}
                    </strong>

                    <small>
                      {review.email ||
                        "-"}
                    </small>

                  </div>

                  {/* Review */}

                  <div className="seller-review-content">

                    <div className="seller-review-rating">

                      {renderStars(
                        review.rating
                      )}

                      <span>
                        {review.rating}/5
                      </span>

                    </div>

                    <p>
                      "{review.review ||
                        "No review text"}"
                    </p>

                    <small>
                      {formatDate(
                        review.created_at ||
                          review.date
                      )}
                    </small>

                  </div>

                  {/* Status */}

                  <div className="seller-review-status">

                    <span
                      className={
                        review.visible
                          ? "status-visible"
                          : "status-hidden"
                      }
                    >
                      {review.visible
                        ? "Visible"
                        : "Hidden"}
                    </span>

                  </div>

                  {/* Actions */}

                  <div className="seller-review-actions">

                    <button
                      type="button"
                      className="review-view-btn"
                      onClick={() =>
                        setSelectedReview(
                          review
                        )
                      }
                      title="View review"
                    >
                      <Eye size={17} />
                    </button>

                    <button
                      type="button"
                      className="review-toggle-btn"
                      onClick={() =>
                        handleToggleVisibility(
                          review
                        )
                      }
                      title={
                        review.visible
                          ? "Hide review"
                          : "Show review"
                      }
                    >
                      {review.visible ? (
                        <EyeOff
                          size={17}
                        />
                      ) : (
                        <Eye
                          size={17}
                        />
                      )}
                    </button>

                    <button
                      type="button"
                      className="review-delete-btn"
                      onClick={() =>
                        handleDelete(
                          review.id
                        )
                      }
                      title="Delete review"
                    >
                      <Trash2
                        size={17}
                      />
                    </button>

                  </div>

                </article>
              )
            )
          )}

        </div>

      </div>

      {/* Review Modal */}

      {selectedReview && (
        <div
          className="seller-review-modal-overlay"
          onClick={() =>
            setSelectedReview(
              null
            )
          }
        >

          <div
            className="seller-review-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="seller-review-modal-header">

              <div>
                <span>
                  Customer Review
                </span>

                <h2>
                  {selectedReview.product}
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedReview(
                    null
                  )
                }
                aria-label="Close"
              >
                <X size={20} />
              </button>

            </div>

            <div className="seller-review-modal-body">

              <div className="modal-customer">

                <strong>
                  {selectedReview.customer}
                </strong>

                <span>
                  {selectedReview.email ||
                    "-"}
                </span>

              </div>

              <div className="modal-rating">

                {renderStars(
                  selectedReview.rating
                )}

                <strong>
                  {selectedReview.rating}/5
                </strong>

              </div>

              <p className="modal-review-text">
                "
                {selectedReview.review ||
                  "No review text"}
                "
              </p>

              <div className="modal-review-date">
                Submitted on{" "}
                {formatDate(
                  selectedReview.created_at ||
                    selectedReview.date
                )}
              </div>

            </div>

            <div className="seller-review-modal-footer">

              <button
                type="button"
                className="modal-toggle-btn"
                onClick={() =>
                  handleToggleVisibility(
                    selectedReview
                  )
                }
              >
                {selectedReview.visible
                  ? "Hide Review"
                  : "Show Review"}
              </button>

              <button
                type="button"
                className="modal-delete-btn"
                onClick={() =>
                  handleDelete(
                    selectedReview.id
                  )
                }
              >
                <Trash2 size={16} />

                Delete Review
              </button>

            </div>

          </div>

        </div>
      )}

    </main>
  );
}

export default SellerReviews;