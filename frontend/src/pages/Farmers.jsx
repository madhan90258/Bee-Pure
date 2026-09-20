import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  ArrowRight,
  MapPin,
  Leaf,
  Handshake,
  Sprout,
  Loader2,
} from "lucide-react";

import "../styles/Farmers.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

/* =========================================
   FARMER IMAGE URL
========================================= */

const getFarmerImageUrl = (imagePath) => {
  if (!imagePath) {
    return "";
  }

  /*
   If database already contains a complete URL
  */
  if (
    imagePath.startsWith("http://") ||
    imagePath.startsWith("https://")
  ) {
    return imagePath;
  }

  /*
   If database contains a frontend public path
   Example:
   /farmers/farmer-1.jpg
  */
  if (imagePath.startsWith("/")) {
    return imagePath;
  }

  /*
   If database only contains the filename
   Example:
   farmer-1.jpg

   Files should exist inside:
   frontend/public/farmers/
  */
  return `/farmers/${imagePath}`;
};


/* =========================================
   FARMERS
========================================= */

function Farmers() {
  const [farmers, setFarmers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  /* =========================================
     LOAD FARMERS FROM BACKEND
  ========================================== */

  useEffect(() => {
    const loadFarmers = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/farmers`
        );

        const result = await response.json();

        if (
          !response.ok ||
          !result.success
        ) {
          throw new Error(
            result.message ||
              "Unable to fetch farmers"
          );
        }

        const mappedFarmers =
          (result.farmers || []).map(
            (farmer) => ({
              id: farmer.id,

              name:
                farmer.name || "",

              location:
                farmer.location || "",

              description:
                farmer.description || "",

              image:
                getFarmerImageUrl(
                  farmer.image_path
                ),
            })
          );

        setFarmers(mappedFarmers);

      } catch (err) {
        console.error(
          "Failed to load farmers:",
          err
        );

        setError(
          err.message ||
            "Unable to load farmers"
        );

      } finally {
        setLoading(false);
      }
    };

    loadFarmers();
  }, []);


  return (
    <main className="farmers-page">

      {/* =========================================
          HERO
      ========================================== */}

      <section className="farmers-hero">

        <div className="farmers-container">

          <div className="farmers-hero-content">

            <p className="farmers-eyebrow">
              THE PEOPLE BEHIND BEE PURE
            </p>

            <h1>
              Meet the Farmers
              <br />
              <span>
                Behind Every Product.
              </span>
            </h1>

            <p className="farmers-hero-description">
              Our products begin with farmers
              who care deeply about the land,
              their craft and the quality of
              what they produce.
            </p>

            <Link
              to="/shop"
              className="farmers-hero-button"
            >
              Explore Products

              <ArrowRight size={17} />
            </Link>

          </div>

        </div>

      </section>


      {/* =========================================
          INTRO
      ========================================== */}

      <section className="farmers-intro">

        <div className="farmers-container">

          <div className="farmers-intro-grid">

            <div className="farmers-intro-heading">

              <p className="farmers-section-eyebrow">
                FROM THEIR FARMS TO YOUR HOME
              </p>

              <h2>
                We know where
                <br />
                our food comes from.
              </h2>

            </div>


            <div className="farmers-intro-text">

              <p>
                Bee Pure works directly with
                local farmers, beekeepers and
                producers who share our belief
                in naturally good food.
              </p>

              <p>
                By building direct relationships,
                we aim to create a transparent
                connection between the people
                who grow and produce our products
                and the families who enjoy them.
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* =========================================
          FARMER LIST
      ========================================== */}

      <section className="farmers-list-section">

        <div className="farmers-container">

          <div className="farmers-section-header">

            <p className="farmers-section-eyebrow">
              OUR FARMER COMMUNITY
            </p>

            <h2>
              The hands behind
              <br />
              what you enjoy.
            </h2>

            <p>
              Every product has a story.
              These are some of the people
              who help make ours possible.
            </p>

          </div>


          {/* =====================================
              LOADING
          ====================================== */}

          {loading && (

            <div className="farmers-loading">

              <Loader2
                size={24}
                className="spin"
              />

              <span>
                Loading farmers...
              </span>

            </div>

          )}


          {/* =====================================
              ERROR
          ====================================== */}

          {!loading && error && (

            <div className="farmers-error">

              <h3>
                Unable to Load Farmers
              </h3>

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

          )}


          {/* =====================================
              EMPTY
          ====================================== */}

          {!loading &&
            !error &&
            farmers.length === 0 && (

              <div className="farmers-empty">

                <h3>
                  No Farmers Available
                </h3>

                <p>
                  There are currently no
                  active farmers to display.
                </p>

              </div>

            )}


          {/* =====================================
              FARMER GRID
          ====================================== */}

          {!loading &&
            !error &&
            farmers.length > 0 && (

              <div className="farmers-grid">

                {farmers.map((farmer) => (

                  <article
                    className="farmer-card"
                    key={farmer.id}
                  >

                    {/* IMAGE */}

                    <div className="farmer-image">

                      {farmer.image ? (

                        <img
                          src={farmer.image}
                          alt={farmer.name}
                          loading="lazy"
                          onError={(event) => {
                            console.error(
                              "Farmer image failed to load:",
                              event.currentTarget.src
                            );
                          }}
                        />

                      ) : (

                        <div className="farmer-image-placeholder">
                          No Image
                        </div>

                      )}

                    </div>


                    {/* CONTENT */}

                    <div className="farmer-content">

                      <h3>
                        {farmer.name}
                      </h3>


                      <div className="farmer-location">

                        <MapPin size={14} />

                        <span>
                          {farmer.location}
                        </span>

                      </div>


                      <p className="farmer-description">
                        {farmer.description}
                      </p>

                    </div>

                  </article>

                ))}

              </div>

            )}

        </div>

      </section>


      {/* =========================================
          OUR PROMISE
      ========================================== */}

      <section className="farmers-promise">

        <div className="farmers-container">

          <div className="farmers-promise-header">

            <p className="farmers-section-eyebrow">
              OUR PROMISE
            </p>

            <h2>
              A better connection
              <br />
              from farm to home.
            </h2>

          </div>


          <div className="farmers-promise-grid">

            {/* CARD 1 */}

            <div className="farmers-promise-card">

              <div className="farmers-promise-icon">

                <Handshake size={22} />

              </div>

              <h3>
                Direct Relationships
              </h3>

              <p>
                We work toward building direct
                and lasting relationships with
                the people who produce our food.
              </p>

            </div>


            {/* CARD 2 */}

            <div className="farmers-promise-card">

              <div className="farmers-promise-icon">

                <Leaf size={22} />

              </div>

              <h3>
                Naturally Sourced
              </h3>

              <p>
                We look for products that respect
                traditional practices and preserve
                their natural character.
              </p>

            </div>


            {/* CARD 3 */}

            <div className="farmers-promise-card">

              <div className="farmers-promise-icon">

                <Sprout size={22} />

              </div>

              <h3>
                Supporting Local
              </h3>

              <p>
                Choosing local producers helps
                strengthen farming communities
                and keeps the connection closer
                to home.
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* =========================================
          CTA
      ========================================== */}

      <section className="farmers-cta">

        <div className="farmers-container">

          <div className="farmers-cta-content">

            <p className="farmers-section-eyebrow">
              TASTE THE DIFFERENCE
            </p>

            <h2>
              Good food starts
              <br />
              with good people.
            </h2>

            <p>
              Discover naturally good products
              sourced through our growing
              farmer community.
            </p>

            <Link
              to="/shop"
              className="farmers-cta-button"
            >
              Shop Bee Pure

              <ArrowRight size={17} />
            </Link>

          </div>

        </div>

      </section>

    </main>
  );
}

export default Farmers;