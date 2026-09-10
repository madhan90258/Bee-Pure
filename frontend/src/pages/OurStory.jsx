import { Link } from "react-router-dom";
import {
  ArrowRight,
  Leaf,
  Heart,
  Users,
  ShieldCheck,
} from "lucide-react";

import "../styles/OurStory.css";

function OurStory() {
  return (
    <main className="our-story-page">

      {/* =========================================
          HERO
      ========================================= */}

      <section className="story-hero">

        <div className="story-container story-hero-grid">

          <div className="story-hero-content">

            <p className="story-eyebrow">
              THE BEE PURE STORY
            </p>

            <h1>
              From Farmers.
              <br />
              <span>From Nature.</span>
              <br />
              For You.
            </h1>

            <p className="story-hero-description">
              Bee Pure was created with a simple idea —
              bring naturally good products from trusted
              farmers directly to the people who value them.
            </p>

            <Link
              to="/shop"
              className="story-primary-button"
            >
              Explore Our Products
              <ArrowRight size={17} />
            </Link>

          </div>


          <div className="story-hero-image">

            <img
              src="/story/our-story-hero.jpg"
              alt="Bee Pure farmers and natural products"
            />

            <div className="story-hero-badge">
              <span>100%</span>
              <small>Natural</small>
            </div>

          </div>

        </div>

      </section>


      {/* =========================================
          OUR BEGINNING
      ========================================= */}

      <section className="story-beginning">

        <div className="story-container story-two-column">

          <div className="story-image-card">

            <img
              src="/story/farmer.jpg"
              alt="Local farmer working on a farm"
            />

          </div>


          <div className="story-section-content">

            <p className="story-eyebrow">
              WHERE IT STARTED
            </p>

            <h2>
              A simple connection
              <br />
              between <span>farmer and family.</span>
            </h2>

            <p>
              Behind every naturally good product is a
              farmer who puts time, care and patience into
              their work.
            </p>

            <p>
              We wanted to create a better connection
              between these farmers and the people who
              enjoy what they produce.
            </p>

            <p>
              That's where Bee Pure began — with the goal
              of making that journey shorter, more
              transparent and more meaningful.
            </p>

          </div>

        </div>

      </section>


      {/* =========================================
          FARMERS FIRST
      ========================================= */}

      <section className="story-farmers">

        <div className="story-container">

          <div className="story-centered-heading">

            <p className="story-eyebrow">
              FARMERS FIRST
            </p>

            <h2>
              Good products begin
              <br />
              with <span>good people.</span>
            </h2>

            <p>
              We believe farmers should be an important
              part of the value they create.
            </p>

          </div>


          <div className="story-values-grid">

            <article className="story-value-card">

              <div className="story-value-icon">
                <Users size={23} />
              </div>

              <h3>
                Direct Connection
              </h3>

              <p>
                We work towards connecting customers
                with products sourced directly from
                trusted local farmers.
              </p>

            </article>


            <article className="story-value-card">

              <div className="story-value-icon">
                <Heart size={23} />
              </div>

              <h3>
                Fair Relationships
              </h3>

              <p>
                Strong relationships with farmers help
                create a more sustainable journey for
                everyone involved.
              </p>

            </article>


            <article className="story-value-card">

              <div className="story-value-icon">
                <Leaf size={23} />
              </div>

              <h3>
                Natural Goodness
              </h3>

              <p>
                We focus on products that stay close to
                their natural origins and everyday goodness.
              </p>

            </article>

          </div>

        </div>

      </section>


      {/* =========================================
          PURE & NATURAL
      ========================================= */}

      <section className="story-purity">

        <div className="story-container story-two-column reverse">

          <div className="story-section-content">

            <p className="story-eyebrow">
              OUR APPROACH
            </p>

            <h2>
              Keep it natural.
              <br />
              Keep it <span>honest.</span>
            </h2>

            <p>
              We believe good food doesn't need to be
              complicated. That's why we focus on carefully
              sourced products and honest presentation.
            </p>

            <div className="story-promise-list">

              <div>
                <ShieldCheck size={20} />

                <div>
                  <strong>
                    Carefully Sourced
                  </strong>

                  <span>
                    Products from trusted sources.
                  </span>
                </div>
              </div>


              <div>
                <Leaf size={20} />

                <div>
                  <strong>
                    Naturally Good
                  </strong>

                  <span>
                    Keeping the focus on natural quality.
                  </span>
                </div>
              </div>


              <div>
                <Heart size={20} />

                <div>
                  <strong>
                    Made With Care
                  </strong>

                  <span>
                    Every product is chosen with purpose.
                  </span>
                </div>
              </div>

            </div>

          </div>


          <div className="story-image-card">

            <img
              src="/story/natural-products.jpg"
              alt="Natural products from Bee Pure"
            />

          </div>

        </div>

      </section>


      {/* =========================================
          OUR PROMISE
      ========================================= */}

      <section className="story-promise">

        <div className="story-container">

          <div className="story-promise-box">

            <p className="story-eyebrow">
              OUR PROMISE
            </p>

            <h2>
              Better for farmers.
              <br />
              Better for <span>you.</span>
            </h2>

            <p>
              Bee Pure is about building a simpler path
              from the people who grow and produce to the
              people who choose to enjoy it.
            </p>

            <Link
              to="/shop"
              className="story-secondary-button"
              
            >
              Discover Bee Pure
              <ArrowRight size={17} />
            </Link>

          </div>

        </div>

      </section>

    </main>
  );
}

export default OurStory;