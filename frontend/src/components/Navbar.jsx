import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  Heart,
} from "lucide-react";

import { useState } from "react";
import { Link } from "react-router-dom";

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="navbar">
      <div className="container navbar-container">

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="navbar-mobile-menu"
          onClick={toggleMenu}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? (
            <X size={24} />
          ) : (
            <Menu size={24} />
          )}
        </button>


        {/* Logo */}
        <Link
          to="/"
          className="navbar-logo"
          onClick={closeMenu}
        >
          <span className="navbar-logo-icon">
            🐝
          </span>

          <span className="navbar-logo-text">
            Bee <span>Pure</span>
          </span>
        </Link>


        {/* Desktop Navigation */}
        <nav className="navbar-nav">

          <Link
            to="/"
            className="navbar-link active"
          >
            Home
          </Link>

          <Link
            to="/shop"
            className="navbar-link"
          >
            Shop
          </Link>

          <Link
            to="/our-story"
            className="navbar-link"
          >
            Our Story
          </Link>

          <Link
            to="/farmers"
            className="navbar-link"
          >
            Farmers
          </Link>

          <Link
            to="/contact"
            className="navbar-link"
          >
            Contact
          </Link>

        </nav>


        {/* Right Actions */}
        <div className="navbar-actions">

          {/* Search */}
          <button
            type="button"
            className="icon-btn navbar-action"
            aria-label="Search"
          >
            <Search size={20} />
          </button>


          {/* Wishlist */}
          <button
            type="button"
            className="icon-btn navbar-action navbar-heart"
            aria-label="Wishlist"
          >
            <Heart size={20} />
          </button>


          {/* Cart */}
          <Link
            to="/cart"
            className="icon-btn navbar-action navbar-cart"
            aria-label="Shopping cart"
          >
            <ShoppingCart size={21} />

            <span className="navbar-cart-count">
              0
            </span>
          </Link>


          {/* Account */}
          <Link
            to="/login"
            className="icon-btn navbar-action"
            aria-label="Account"
          >
            <User size={20} />
          </Link>

        </div>


        {/* Mobile Navigation */}
        <nav
          className={`navbar-mobile-nav ${
            isMenuOpen ? "open" : ""
          }`}
        >

          <Link
            to="/"
            className="navbar-mobile-link active"
            onClick={closeMenu}
          >
            Home
          </Link>

          <Link
            to="/shop"
            className="navbar-mobile-link"
            onClick={closeMenu}
          >
            Shop
          </Link>

          <Link
            to="/our-story"
            className="navbar-mobile-link"
            onClick={closeMenu}
          >
            Our Story
          </Link>

          <Link
            to="/farmers"
            className="navbar-mobile-link"
            onClick={closeMenu}
          >
            Farmers
          </Link>

          <Link
            to="/contact"
            className="navbar-mobile-link"
            onClick={closeMenu}
          >
            Contact
          </Link>

        </nav>

      </div>
    </header>
  );
}

export default Navbar;