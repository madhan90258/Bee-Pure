import { Link } from "react-router-dom";
import {
  ArrowRight,
  MapPin,
  Leaf,
  Handshake,
  Sprout,
} from "lucide-react";

import "../styles/Farmers.css";

function Farmers() {
  const farmers = [
    {
      id: 1,
      name: "Ramesh Kumar",
      location: "Western Ghats",
      specialty: "Forest Honey",
      image: "/farmers/farmer-1.jpg",
      description:
        "Ramesh works closely with local forests and beekeeping communities to carefully collect naturally produced forest honey.",
    },
    {
      id: 2,
      name: "Lakshmi Devi",
      location: "Andhra Pradesh",
      specialty: "Natural Jaggery",
      image: "/farmers/farmer-2.jpg",
      description:
        "Lakshmi and her family prepare traditional jaggery using locally grown sugarcane and time-tested methods.",
    },
    {
      id: 3,
      name: "Suresh Rao",
      location: "Telangana",
      specialty: "Organic Turmeric",
      image: "/farmers/farmer-3.jpg",
      description:
        "Suresh grows turmeric using careful farming practices focused on maintaining the natural quality of the crop.",
    },
    {
      id: 4,
      name: "Anitha & Family",
      location: "Karnataka",
      specialty: "A2 Ghee",
      image: "/farmers/farmer-4.jpg",
      description:
        "Anitha's family follows traditional preparation methods to create rich, naturally prepared ghee.",
    },
  ];

  return (
    <main className="farmers-page">

      {/* =========================================
          HERO
      ========================================= */}

      <section className="farmers-hero">

        <div className="farmers-container">

          <div className="farmers-hero-content">

            <p className="farmers-eyebrow">
              THE PEOPLE BEHIND BEE PURE
            </p>

            <h1>
              Meet the Farmers
              <br />
              <span>Behind Every Product.</span>
            </h1>

            <p className="farmers-hero-description">
              Our products begin with farmers who care deeply
              about the land, their craft and the quality of
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
      ========================================= */}

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
                Bee Pure works directly with local farmers,
                beekeepers and producers who share our belief
                in naturally good food.
              </p>

              <p>
                By building direct relationships, we aim to
                create a transparent connection between the
                people who grow and produce our products and
                the families who enjoy them.
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* =========================================
          FARMER CARDS
      ========================================= */}

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
              Every product has a story. These are some of
              the people who help make ours possible.
            </p>

          </div>


          <div className="farmers-grid">

            {farmers.map((farmer) => (

              <article
                className="farmer-card"
                key={farmer.id}
              >

                <div className="farmer-image">

                  <img
                    src={farmer.image}
                    alt={farmer.name}
                    loading="lazy"
                  />

                </div>


                <div className="farmer-content">

                  <p className="farmer-specialty">
                    {farmer.specialty}
                  </p>

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

        </div>

      </section>


      {/* =========================================
          OUR PROMISE
      ========================================= */}

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

            <div className="farmers-promise-card">

              <div className="farmers-promise-icon">
                <Handshake size={22} />
              </div>

              <h3>
                Direct Relationships
              </h3>

              <p>
                We work toward building direct and lasting
                relationships with the people who produce
                our food.
              </p>

            </div>


            <div className="farmers-promise-card">

              <div className="farmers-promise-icon">
                <Leaf size={22} />
              </div>

              <h3>
                Naturally Sourced
              </h3>

              <p>
                We look for products that respect traditional
                practices and preserve their natural character.
              </p>

            </div>


            <div className="farmers-promise-card">

              <div className="farmers-promise-icon">
                <Sprout size={22} />
              </div>

              <h3>
                Supporting Local
              </h3>

              <p>
                Choosing local producers helps strengthen
                farming communities and keeps the connection
                closer to home.
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* =========================================
          CTA
      ========================================= */}

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
              Discover naturally good products sourced
              through our growing farmer community.
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