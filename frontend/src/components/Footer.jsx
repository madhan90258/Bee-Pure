import { Link } from "react-router-dom";
import {
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">

      <div className="footer-main">

        <div className="container footer-grid">

          {/* Brand */}

          <div className="footer-brand">

            <Link to="/" className="footer-logo">
              <span className="footer-logo-icon">🐝</span>

              <span>
                Bee <span>Pure</span>
              </span>
            </Link>

            <p>
              Pure, natural products sourced directly
              from trusted farmers and delivered to your home.
            </p>

            

          </div>


          {/* Quick Links */}

          <div className="footer-column">

            <h3>Quick Links</h3>

            <Link to="/">Home</Link>
            <Link to="/shop">Shop</Link>
            <Link to="/our-story">Our Story</Link>
            <Link to="/farmers">Our Farmers</Link>
            <Link to="/contact">Contact</Link>

          </div>


          {/* Customer Care */}

          <div className="footer-column">

            <h3>Customer Care</h3>

            <Link to="/cart">Shopping Cart</Link>
            <Link to="/checkout">Checkout</Link>
            <Link to="/login">My Account</Link>

            <a href="#">
              Shipping & Delivery
            </a>

            <a href="#">
              Returns & Refunds
            </a>

          </div>


          {/* Contact */}

          <div className="footer-column footer-contact">

            <h3>Get In Touch</h3>

            <div>
              <MapPin size={16} />
              <span>
                Tamil Nadu, India
              </span>
            </div>

            <div>
              <Phone size={16} />
              <span>
                +91 98765 43210
              </span>
            </div>

            <div>
              <Mail size={16} />
              <span>
                hello@beepure.com
              </span>
            </div>

          </div>

        </div>

      </div>


      {/* Bottom */}

      <div className="footer-bottom">

        <div className="container footer-bottom-inner">

          <p>
            © {new Date().getFullYear()} Bee Pure.
            All rights reserved.
          </p>

          <div>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms & Conditions</a>
          </div>

        </div>

      </div>

    </footer>
  );
}

export default Footer;