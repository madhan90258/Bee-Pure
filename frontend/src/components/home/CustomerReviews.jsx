import { Star } from "lucide-react";
import "./CustomerReviews.css";

const reviews = [
  {
    id: 1,
    name: "Priya S.",
    location: "Chennai",
    review:
      "The honey tastes so fresh and natural. I really love knowing that it comes directly from farmers.",
  },
  {
    id: 2,
    name: "Arun K.",
    location: "Coimbatore",
    review:
      "Excellent quality and beautiful packaging. The products feel genuinely pure and trustworthy.",
  },
  {
    id: 3,
    name: "Meena R.",
    location: "Bengaluru",
    review:
      "Bee Pure has become my go-to place for natural products. Everything feels fresh and authentic.",
  },
];

function CustomerReviews() {
  return (
    <section className="reviews-section">

      <div className="container reviews-container">

        {/* Header */}

        <div className="reviews-header">

          <p className="reviews-eyebrow">
            FROM OUR CUSTOMERS
          </p>

          <h2>
            Loved by People Who Choose Pure
          </h2>

          <p className="reviews-subtitle">
            Real experiences from customers who believe
            in naturally good products.
          </p>

        </div>


        {/* Reviews */}

        <div className="reviews-grid">

          {reviews.map((review) => (

            <article
              className="review-card"
              key={review.id}
            >

              <div className="review-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={16}
                    fill="currentColor"
                  />
                ))}
              </div>


              <p className="review-text">
                "{review.review}"
              </p>


              <div className="review-author">

                <div className="review-avatar">
                  {review.name.charAt(0)}
                </div>

                <div>
                  <strong>
                    {review.name}
                  </strong>

                  <span>
                    {review.location}
                  </span>
                </div>

              </div>

            </article>

          ))}

        </div>

      </div>

    </section>
  );
}

export default CustomerReviews;