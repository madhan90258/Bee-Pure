import { useState } from "react";
import {
  Star,
  Trash2,
  Eye,
  EyeOff,
  Search,
  X,
} from "lucide-react";

import "../styles/SellerReviews.css";

function SellerReviews() {
  const [reviews, setReviews] = useState([
    {
      id: 1,
      product: "Pure Forest Honey",
      customer: "Arun Kumar",
      email: "arun@example.com",
      rating: 5,
      review:
        "The honey tastes very natural and fresh. Really happy with the quality.",
      date: "08 Sep 2026",
      visible: true,
    },
    {
      id: 2,
      product: "Raw Organic Honey",
      customer: "Priya S",
      email: "priya@example.com",
      rating: 4,
      review:
        "Good quality honey and nicely packed. Delivery was also quick.",
      date: "07 Sep 2026",
      visible: true,
    },
    {
      id: 3,
      product: "Organic Turmeric",
      customer: "Rahul M",
      email: "rahul@example.com",
      rating: 5,
      review:
        "Very good turmeric. The colour and aroma are excellent.",
      date: "06 Sep 2026",
      visible: true,
    },
    {
      id: 4,
      product: "Organic A2 Ghee",
      customer: "Meena R",
      email: "meena@example.com",
      rating: 3,
      review:
        "The product is good but I expected faster delivery.",
      date: "05 Sep 2026",
      visible: false,
    },
  ]);

  const [search, setSearch] = useState("");
  const [selectedReview, setSelectedReview] = useState(null);

  // =========================================
  // DELETE REVIEW
  // =========================================

  const handleDelete = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this review?"
    );

    if (!confirmed) return;

    setReviews((prev) =>
      prev.filter((review) => review.id !== id)
    );

    if (selectedReview?.id === id) {
      setSelectedReview(null);
    }
  };

  // =========================================
  // SHOW / HIDE REVIEW
  // =========================================

  const handleToggleVisibility = (id) => {
    setReviews((prev) =>
      prev.map((review) =>
        review.id === id
          ? {
              ...review,
              visible: !review.visible,
            }
          : review
      )
    );

    if (selectedReview?.id === id) {
      setSelectedReview((prev) => ({
        ...prev,
        visible: !prev.visible,
      }));
    }
  };

  // =========================================
  // FILTER
  // =========================================

  const filteredReviews = reviews.filter((review) => {
    const query = search.toLowerCase().trim();

    if (!query) return true;

    return (
      review.product.toLowerCase().includes(query) ||
      review.customer.toLowerCase().includes(query) ||
      review.email.toLowerCase().includes(query) ||
      review.review.toLowerCase().includes(query)
    );
  });

  // =========================================
  // STATS
  // =========================================

  const totalReviews = reviews.length;

  const visibleReviews = reviews.filter(
    (review) => review.visible
  ).length;

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce(
            (total, review) => total + review.rating,
            0
          ) / reviews.length
        ).toFixed(1)
      : "0.0";

  const renderStars = (rating) => {
    return (
      <div className="seller-review-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={15}
            fill={
              star <= rating
                ? "currentColor"
                : "none"
            }
          />
        ))}
      </div>
    );
  };

  return (
    <main className="seller-reviews-page">
      <div className="seller-reviews-container">

        {/* =====================================
            HEADER
        ===================================== */}

        <div className="seller-reviews-header">

          <div>
            <p className="seller-reviews-eyebrow">
              Seller Panel
            </p>

            <h1>Customer Reviews</h1>

            <p className="seller-reviews-subtitle">
              View and manage reviews submitted by
              your customers.
            </p>
          </div>

        </div>


        {/* =====================================
            STATS
        ===================================== */}

        <div className="seller-review-stats">

          <div className="seller-review-stat-card">
            <span>Total Reviews</span>
            <strong>{totalReviews}</strong>
          </div>

          <div className="seller-review-stat-card">
            <span>Visible Reviews</span>
            <strong>{visibleReviews}</strong>
          </div>

          <div className="seller-review-stat-card">
            <span>Average Rating</span>

            <strong>
              {averageRating}
              <span className="rating-small">
                / 5
              </span>
            </strong>
          </div>

        </div>


        {/* =====================================
            TOOLBAR
        ===================================== */}

        <div className="seller-reviews-toolbar">

          <div className="seller-review-search">

            <Search size={18} />

            <input
              type="search"
              placeholder="Search reviews, customers or products..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}

          </div>

          <span className="seller-review-result-count">
            {filteredReviews.length} review
            {filteredReviews.length !== 1
              ? "s"
              : ""}
          </span>

        </div>


        {/* =====================================
            REVIEWS
        ===================================== */}

        <div className="seller-reviews-list">

          {filteredReviews.length === 0 ? (

            <div className="seller-reviews-empty">

              <Star size={38} />

              <h3>No reviews found</h3>

              <p>
                Try searching with another product
                or customer name.
              </p>

            </div>

          ) : (

            filteredReviews.map((review) => (

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
                    {review.email}
                  </small>

                </div>


                {/* Review */}

                <div className="seller-review-content">

                  <div className="seller-review-rating">

                    {renderStars(review.rating)}

                    <span>
                      {review.rating}/5
                    </span>

                  </div>

                  <p>
                    "{review.review}"
                  </p>

                  <small>
                    {review.date}
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
                      setSelectedReview(review)
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
                        review.id
                      )
                    }
                    title={
                      review.visible
                        ? "Hide review"
                        : "Show review"
                    }
                  >
                    {review.visible ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>

                  <button
                    type="button"
                    className="review-delete-btn"
                    onClick={() =>
                      handleDelete(review.id)
                    }
                    title="Delete review"
                  >
                    <Trash2 size={17} />
                  </button>

                </div>

              </article>

            ))

          )}

        </div>

      </div>


      {/* =====================================
          REVIEW DETAILS MODAL
      ===================================== */}

      {selectedReview && (

        <div
          className="seller-review-modal-overlay"
          onClick={() => setSelectedReview(null)}
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
                  setSelectedReview(null)
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
                  {selectedReview.email}
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
                "{selectedReview.review}"
              </p>


              <div className="modal-review-date">
                Submitted on{" "}
                {selectedReview.date}
              </div>

            </div>


            <div className="seller-review-modal-footer">

              <button
                type="button"
                className="modal-toggle-btn"
                onClick={() =>
                  handleToggleVisibility(
                    selectedReview.id
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