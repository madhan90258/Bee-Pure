import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import desktopHero from "../../assets/bee-pure-hero-desktop.png";
import mobileHero from "../../assets/bee-pure-hero-mobile.png";

function Hero() {
  return (
    <section
      className="hero-section"
      style={{
        "--hero-desktop": `url(${desktopHero})`,
        "--hero-mobile": `url(${mobileHero})`,
      }}
    >
      <div className="hero-overlay"></div>

      <div className="container hero-container">
        <div className="hero-content">

          <p className="hero-eyebrow">
            FARM DIRECT. NATURALLY PURE.
          </p>

          <h1 className="hero-title">
            Pure by Nature.
            <br />
            <span>Pure by Us.</span>
          </h1>

          <p className="hero-description">
            Organic products directly from trusted
            <br />
            local farmers to your home.
          </p>

          <div className="hero-benefits">

            <div className="hero-benefit">
              <span>🌿</span>
              <strong>100% Natural</strong>
            </div>

            <div className="hero-benefit">
              <span>♡</span>
              <strong>No Added Sugar</strong>
            </div>

            <div className="hero-benefit">
              <span>⚗</span>
              <strong>No Preservatives</strong>
            </div>

            <div className="hero-benefit">
              <span>♧</span>
              <strong>
                Supports
                <br />
                Local Farmers
              </strong>
            </div>

          </div>

          <div className="hero-actions">

            <Link
              to="/shop"
              className="hero-primary-btn"
            >
              Shop Organic Products
              <ArrowRight size={18} />
            </Link>

            <Link
              to="/farmers"
              className="hero-secondary-btn"
            >
              Meet Our Farmers
            </Link>

          </div>

        </div>
      </div>

    </section>
  );
}

export default Hero;