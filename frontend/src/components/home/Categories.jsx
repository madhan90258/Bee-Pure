import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Categories.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/categories`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load categories"
          );
        }

        setCategories(
          Array.isArray(data)
            ? data
            : data.categories || data.data || []
        );
      } catch (err) {
        console.error(
          "Failed to fetch categories:",
          err
        );

        setError(
          err.message || "Failed to load categories"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <section className="categories-section">
      <div className="container categories-container">

        {/* SECTION HEADER */}

        <div className="categories-header">

          <div className="categories-heading">
            <h2>
              Shop By Categories
            </h2>

            <p className="categories-subtitle">
              Discover naturally good products, sourced
              directly from trusted farmers.
            </p>
          </div>

          <Link
            to="/shop"
            className="categories-view-all"
          >
            <span>View All</span>

            <span className="categories-view-arrow">
              →
            </span>
          </Link>

        </div>


        {/* LOADING */}

        {loading && (
          <div className="categories-grid">
            {[1, 2, 3, 4].map((item) => (
              <div
                className="category-card"
                key={item}
              >
                <div className="category-image-wrapper">
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      minHeight: "220px",
                      background: "#f2f2f2",
                    }}
                  />
                </div>

                <div className="category-content">
                  <h3>Loading...</h3>
                  <p>Please wait</p>
                </div>
              </div>
            ))}
          </div>
        )}


        {/* ERROR */}

        {!loading && error && (
          <div
            style={{
              textAlign: "center",
              padding: "40px 20px",
              color: "#b42318",
            }}
          >
            <p>
              Unable to load categories.
            </p>

            <small>
              {error}
            </small>
          </div>
        )}


        {/* CATEGORY GRID */}

        {!loading &&
          !error &&
          categories.length > 0 && (
            <div className="categories-grid">

              {categories.map((category) => (

                <Link
                  key={category.id}
                  to={`/shop?category=${category.slug}`}
                  className="category-card"
                >

                  {/* IMAGE */}

                  <div className="category-image-wrapper">

                    <img
                      src={
                        category.image_url ||
                        category.image ||
                        "/categories/honey.png"
                      }
                      alt={category.name}
                      className="category-image"
                      loading="lazy"
                    />

                    <div className="category-image-overlay"></div>

                  </div>


                  {/* CONTENT */}

                  <div className="category-content">

                    <h3>
                      {category.name}
                    </h3>

                    <p>
                      {category.description ||
                        "Naturally good products"}
                    </p>

                    <span className="category-explore">
                      Explore

                      <span className="category-explore-arrow">
                        →
                      </span>
                    </span>

                  </div>

                </Link>

              ))}

            </div>
          )}


        {/* NO CATEGORIES */}

        {!loading &&
          !error &&
          categories.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "40px 20px",
              }}
            >
              <p>
                No categories available.
              </p>
            </div>
          )}

      </div>
    </section>
  );
}

export default Categories;