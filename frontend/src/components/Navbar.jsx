import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  Heart,
} from "lucide-react";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate();

  // =========================================
  // MOBILE MENU
  // =========================================

  const toggleMenu = () => {
    setIsMenuOpen((current) => !current);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // =========================================
  // PRODUCTS
  //
  // Keep this synchronized with Shop.jsx
  // =========================================

  const products = [
    {
      id: 1,
      name: "Pure Forest Honey",
      category: "Honey",
      price: 499,
      oldPrice: 599,
      image: "/products/forest-honey.jpg",
      rating: 5,
      description:
        "Pure forest honey collected naturally from trusted local beekeepers. Rich in natural goodness, flavour and nutrients.",
    },

    {
      id: 2,
      name: "Raw Organic Honey",
      category: "Honey",
      price: 399,
      oldPrice: null,
      image: "/products/raw-honey.jpg",
      rating: 5,
      description:
        "Naturally raw and minimally processed honey sourced directly from trusted farmers.",
    },

    {
      id: 3,
      name: "Natural Jaggery",
      category: "Natural Sweeteners",
      price: 249,
      oldPrice: 299,
      image: "/products/jaggery.jpg",
      rating: 4,
      description:
        "Traditional natural jaggery made with care and sourced directly from local producers.",
    },

    {
      id: 4,
      name: "Organic Turmeric",
      category: "Healthy Foods",
      price: 199,
      oldPrice: null,
      image: "/products/turmeric.jpg",
      rating: 5,
      description:
        "Naturally grown turmeric with rich colour, flavour and everyday wellness benefits.",
    },

    {
      id: 5,
      name: "Organic A2 Ghee",
      category: "Healthy Foods",
      price: 699,
      oldPrice: 799,
      image: "/products/ghee.jpg",
      rating: 5,
      description:
        "Traditional A2 ghee made from quality milk and prepared with care.",
    },

    {
      id: 6,
      name: "Forest Bee Honey",
      category: "Honey",
      price: 549,
      oldPrice: null,
      image: "/products/forest-bee-honey.jpg",
      rating: 5,
      description:
        "Authentic forest honey with a naturally rich taste, sourced from local beekeepers.",
    },
  ];

  // =========================================
  // SEARCH
  // =========================================

  const handleSearch = (event) => {
    event.preventDefault();

    const query = searchQuery.trim();

    // Do nothing if search box is empty
    if (!query) {
      return;
    }

    const normalizedQuery = query.toLowerCase();

    // =========================================
    // EXACT PRODUCT NAME
    //
    // Example:
    // "Pure Forest Honey"
    //
    // Goes directly to:
    // /product/1
    // =========================================

    const exactProduct = products.find(
      (product) =>
        product.name.toLowerCase() === normalizedQuery
    );

    if (exactProduct) {
      navigate(`/product/${exactProduct.id}`);

      setSearchQuery("");
      setIsSearchOpen(false);
      closeMenu();

      return;
    }

    // =========================================
    // SEARCH BY:
    //
    // - Name
    // - Description
    // - Category
    //
    // The Shop page will handle the filtering.
    // =========================================

    navigate(
      `/shop?search=${encodeURIComponent(query)}`
    );

    setSearchQuery("");
    setIsSearchOpen(false);
    closeMenu();
  };

  // =========================================
  // SEARCH TOGGLE
  // =========================================

  const handleSearchToggle = () => {
    setIsSearchOpen((current) => !current);

    // Close mobile menu when opening search
    setIsMenuOpen(false);
  };

  // =========================================
  // CLOSE SEARCH
  // =========================================

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  // =========================================
  // RENDER
  // =========================================

  return (
    <header className="navbar">
      <div className="container navbar-container">

        {/* =====================================
            MOBILE MENU BUTTON
        ===================================== */}

        <button
          type="button"
          className="navbar-mobile-menu"
          onClick={toggleMenu}
          aria-label={
            isMenuOpen
              ? "Close navigation menu"
              : "Open navigation menu"
          }
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? (
            <X size={24} />
          ) : (
            <Menu size={24} />
          )}
        </button>


        {/* =====================================
            LOGO
        ===================================== */}

        <Link
          to="/"
          className="navbar-logo"
          onClick={() => {
            closeMenu();
            closeSearch();
          }}
          aria-label="Bee Pure Home"
        >
          <span className="navbar-logo-icon">
            🐝
          </span>

          <span className="navbar-logo-text">
            Bee <span>Pure</span>
          </span>
        </Link>


        {/* =====================================
            DESKTOP NAVIGATION
        ===================================== */}

        <nav
          className="navbar-nav"
          aria-label="Main navigation"
        >

          <Link
            to="/"
            className="navbar-link"
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


        {/* =====================================
            RIGHT ACTIONS
        ===================================== */}

        <div className="navbar-actions">

          {/* SEARCH */}

          <button
            type="button"
            className="icon-btn navbar-action"
            aria-label={
              isSearchOpen
                ? "Close search"
                : "Search products"
            }
            aria-expanded={isSearchOpen}
            onClick={handleSearchToggle}
          >
            {isSearchOpen ? (
              <X size={20} />
            ) : (
              <Search size={20} />
            )}
          </button>


          {/* WISHLIST */}

          <Link
  to="/favorites"
  className="icon-btn navbar-action navbar-heart"
  aria-label="Favorites"
>
  <Heart size={20} />
</Link>


          {/* CART */}

          <Link
            to="/cart"
            className="icon-btn navbar-action navbar-cart"
            aria-label="Shopping cart"
            onClick={closeMenu}
          >
            <ShoppingCart size={21} />

            <span className="navbar-cart-count">
              0
            </span>
          </Link>


          {/* ACCOUNT */}

          <Link
            to="/Account"
            className="icon-btn navbar-action"
            aria-label="Account"
            onClick={closeMenu}
          >
            <User size={20} />
          </Link>

        </div>


        {/* =====================================
            SEARCH FORM
        ===================================== */}

        {isSearchOpen && (
          <form
            className="navbar-search-form"
            onSubmit={handleSearch}
          >

            <Search
              size={18}
              aria-hidden="true"
            />

            <input
              type="search"
              name="search"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(event.target.value)
              }
              autoFocus
              autoComplete="off"
              aria-label="Search products"
            />

            <button
              type="submit"
              disabled={!searchQuery.trim()}
            >
              Search
            </button>

          </form>
        )}


        {/* =====================================
            MOBILE NAVIGATION
        ===================================== */}

        <nav
          className={`navbar-mobile-nav ${
            isMenuOpen ? "open" : ""
          }`}
          aria-label="Mobile navigation"
        >

          <Link
            to="/"
            className="navbar-mobile-link"
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

          <Link
            to="/Account"
            className="navbar-mobile-link"
            onClick={closeMenu}
          >
            Account
          </Link>

        </nav>

      </div>
    </header>
  );
}

export default Navbar;