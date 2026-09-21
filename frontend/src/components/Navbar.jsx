import {
  ShoppingCart,
  User,
  Menu,
  X,
  Heart,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Link,
  useLocation,
} from "react-router-dom";

import { supabase } from "../lib/supabase";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

function Navbar() {
  const location =
    useLocation();

  // =========================================
  // UI STATE
  // =========================================

  const [isMenuOpen, setIsMenuOpen] =
    useState(false);

  const [cartCount, setCartCount] =
    useState(0);

  const [favoritesCount, setFavoritesCount] =
    useState(0);

  // =========================================
  // AUTH STATE
  // =========================================

  const [isLoggedIn, setIsLoggedIn] =
    useState(false);

  const [userRole, setUserRole] =
    useState(null);

  // =========================================
  // GET SESSION + ROLE
  // =========================================

  const getSession =
    useCallback(async () => {
      try {
        const {
          data,
          error,
        } =
          await supabase.auth.getSession();

        if (error) {
          console.error(
            "Navbar session error:",
            error
          );

          setIsLoggedIn(false);
          setUserRole(null);

          return null;
        }

        const session =
          data?.session || null;

        // -----------------------------------------
        // NOT LOGGED IN
        // -----------------------------------------

        if (!session) {
          setIsLoggedIn(false);
          setUserRole(null);

          return null;
        }

        // -----------------------------------------
        // LOGGED IN
        // -----------------------------------------

        setIsLoggedIn(true);

        // -----------------------------------------
        // GET ROLE
        // -----------------------------------------

        const {
          data: profile,
          error: profileError,
        } =
          await supabase
            .from("profiles")
            .select("role")
            .eq(
              "id",
              session.user.id
            )
            .single();

        if (profileError) {
          console.error(
            "Navbar profile error:",
            profileError
          );

          setUserRole(null);

          return session;
        }

        setUserRole(
          profile?.role || null
        );

        return session;
      } catch (error) {
        console.error(
          "Navbar session error:",
          error
        );

        setIsLoggedIn(false);
        setUserRole(null);

        return null;
      }
    }, []);

  // =========================================
  // UPDATE CART COUNT
  // =========================================

  const updateCartCount =
    useCallback(async (session) => {
      try {
        if (!session) {
          setCartCount(0);
          return;
        }

        const response =
          await fetch(
            `${API_URL}/api/cart`,
            {
              method: "GET",

              headers: {
                Authorization:
                  `Bearer ${session.access_token}`,
              },
            }
          );

        if (!response.ok) {
          setCartCount(0);
          return;
        }

        const result =
          await response.json();

        if (!result.success) {
          setCartCount(0);
          return;
        }

        const totalItems =
          (result.cart || []).reduce(
            (total, item) =>
              total +
              (
                Number(
                  item.quantity
                ) || 0
              ),
            0
          );

        setCartCount(
          totalItems
        );
      } catch (error) {
        console.error(
          "Unable to load cart count:",
          error
        );

        setCartCount(0);
      }
    }, []);

  // =========================================
  // UPDATE FAVORITES COUNT
  // =========================================

  const updateFavoritesCount =
    useCallback(async (session) => {
      try {
        if (!session) {
          setFavoritesCount(0);
          return;
        }

        const response =
          await fetch(
            `${API_URL}/api/favorites`,
            {
              method: "GET",

              headers: {
                Authorization:
                  `Bearer ${session.access_token}`,
              },
            }
          );

        if (!response.ok) {
          setFavoritesCount(0);
          return;
        }

        const result =
          await response.json();

        if (!result.success) {
          setFavoritesCount(0);
          return;
        }

        setFavoritesCount(
          (
            result.favorites ||
            []
          ).length
        );
      } catch (error) {
        console.error(
          "Unable to load favorites count:",
          error
        );

        setFavoritesCount(0);
      }
    }, []);

  // =========================================
  // UPDATE ALL USER DATA
  // =========================================

  const updateUserData =
    useCallback(async () => {
      const session =
        await getSession();

      if (!session) {
        setCartCount(0);
        setFavoritesCount(0);

        return;
      }

      await Promise.all([
        updateCartCount(session),
        updateFavoritesCount(session),
      ]);
    }, [
      getSession,
      updateCartCount,
      updateFavoritesCount,
    ]);

  // =========================================
  // INITIAL LOAD + AUTH LISTENER
  // =========================================

  useEffect(() => {
    updateUserData();

    const {
      data: authListener,
    } =
      supabase.auth.onAuthStateChange(
        async () => {
          await updateUserData();
        }
      );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [updateUserData]);

  // =========================================
  // CART / FAVORITES EVENTS
  // =========================================

  useEffect(() => {
    const handleCartUpdate =
      async () => {
        const session =
          await getSession();

        await updateCartCount(
          session
        );
      };

    const handleFavoritesUpdate =
      async () => {
        const session =
          await getSession();

        await updateFavoritesCount(
          session
        );
      };

    window.addEventListener(
      "beePureCartUpdated",
      handleCartUpdate
    );

    window.addEventListener(
      "cartUpdated",
      handleCartUpdate
    );

    window.addEventListener(
      "favoritesUpdated",
      handleFavoritesUpdate
    );

    return () => {
      window.removeEventListener(
        "beePureCartUpdated",
        handleCartUpdate
      );

      window.removeEventListener(
        "cartUpdated",
        handleCartUpdate
      );

      window.removeEventListener(
        "favoritesUpdated",
        handleFavoritesUpdate
      );
    };
  }, [
    getSession,
    updateCartCount,
    updateFavoritesCount,
  ]);

  // =========================================
  // CLOSE MOBILE MENU
  // =========================================

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // =========================================
  // TOGGLE MOBILE MENU
  // =========================================

  const toggleMenu = () => {
    setIsMenuOpen(
      (current) => !current
    );
  };

  // =========================================
  // ACTIVE LINK
  // =========================================

  const isActive = (
    path
  ) => {
    if (path === "/") {
      return (
        location.pathname === "/"
      );
    }

    return location.pathname.startsWith(
      path
    );
  };

  // =========================================
  // ACCOUNT ROUTE
  // =========================================

  const getAccountRoute = () => {
    // Logged out
    if (!isLoggedIn) {
      return "/login";
    }

    // Seller / Admin
    if (
      userRole === "seller" ||
      userRole === "admin"
    ) {
      return "/seller/account";
    }

    // Customer
    if (
      userRole === "customer"
    ) {
      return "/account";
    }

    // Unknown role
    return "/login";
  };

  // =========================================
  // ACCOUNT LABEL
  // =========================================

  const getAccountLabel = () => {
    if (!isLoggedIn) {
      return "Login";
    }

    if (
      userRole === "seller" ||
      userRole === "admin"
    ) {
      return "Seller Account";
    }

    if (
      userRole === "customer"
    ) {
      return "My Account";
    }

    return "Login";
  };

  // =========================================
  // RENDER
  // =========================================

  return (
    <header className="navbar">

      <div className="container navbar-container">

        {/* =====================================
            MOBILE MENU BUTTON
        ====================================== */}

        <button
          type="button"
          className="navbar-mobile-menu"
          onClick={toggleMenu}
          aria-label={
            isMenuOpen
              ? "Close navigation menu"
              : "Open navigation menu"
          }
          aria-expanded={
            isMenuOpen
          }
        >
          {isMenuOpen ? (
            <X size={24} />
          ) : (
            <Menu size={24} />
          )}
        </button>

        {/* =====================================
            LOGO
        ====================================== */}

        <Link
          to="/"
          className="navbar-logo"
          onClick={closeMenu}
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
        ====================================== */}

        <nav
          className="navbar-nav"
          aria-label="Main navigation"
        >

          <Link
            to="/"
            className={`navbar-link ${
              isActive("/")
                ? "active"
                : ""
            }`}
          >
            Home
          </Link>

          <Link
            to="/shop"
            className={`navbar-link ${
              isActive("/shop")
                ? "active"
                : ""
            }`}
          >
            Shop
          </Link>

          <Link
            to="/our-story"
            className={`navbar-link ${
              isActive("/our-story")
                ? "active"
                : ""
            }`}
          >
            Our Story
          </Link>

          <Link
            to="/farmers"
            className={`navbar-link ${
              isActive("/farmers")
                ? "active"
                : ""
            }`}
          >
            Farmers
          </Link>

          <Link
            to="/contact"
            className={`navbar-link ${
              isActive("/contact")
                ? "active"
                : ""
            }`}
          >
            Contact
          </Link>

        </nav>

        {/* =====================================
            RIGHT ACTIONS
        ====================================== */}

        <div className="navbar-actions">

          {/* FAVORITES */}

          <Link
            to="/favorites"
            className={`icon-btn navbar-action navbar-heart ${
              isActive("/favorites")
                ? "active"
                : ""
            }`}
            aria-label="Favorites"
            onClick={closeMenu}
          >
            <Heart size={20} />

            {favoritesCount > 0 && (
              <span className="navbar-favorites-count">
                {favoritesCount > 99
                  ? "99+"
                  : favoritesCount}
              </span>
            )}
          </Link>

          {/* CART */}

          <Link
            to="/cart"
            className={`icon-btn navbar-action navbar-cart ${
              isActive("/cart")
                ? "active"
                : ""
            }`}
            aria-label="Shopping cart"
            onClick={closeMenu}
          >
            <ShoppingCart
              size={21}
            />

            {cartCount > 0 && (
              <span className="navbar-cart-count">
                {cartCount > 99
                  ? "99+"
                  : cartCount}
              </span>
            )}
          </Link>

          {/* ACCOUNT */}

          <Link
            to={getAccountRoute()}
            className={`icon-btn navbar-action ${
              isActive("/account") ||
              isActive("/seller/account") ||
              isActive("/login")
                ? "active"
                : ""
            }`}
            aria-label={
              getAccountLabel()
            }
            onClick={closeMenu}
          >
            <User size={20} />
          </Link>

        </div>

        {/* =====================================
            MOBILE NAVIGATION
        ====================================== */}

        <nav
          className={`navbar-mobile-nav ${
            isMenuOpen
              ? "open"
              : ""
          }`}
          aria-label="Mobile navigation"
        >

          <Link
            to="/"
            className={`navbar-mobile-link ${
              isActive("/")
                ? "active"
                : ""
            }`}
            onClick={closeMenu}
          >
            Home
          </Link>

          <Link
            to="/shop"
            className={`navbar-mobile-link ${
              isActive("/shop")
                ? "active"
                : ""
            }`}
            onClick={closeMenu}
          >
            Shop
          </Link>

          <Link
            to="/our-story"
            className={`navbar-mobile-link ${
              isActive("/our-story")
                ? "active"
                : ""
            }`}
            onClick={closeMenu}
          >
            Our Story
          </Link>

          <Link
            to="/farmers"
            className={`navbar-mobile-link ${
              isActive("/farmers")
                ? "active"
                : ""
            }`}
            onClick={closeMenu}
          >
            Farmers
          </Link>

          <Link
            to="/contact"
            className={`navbar-mobile-link ${
              isActive("/contact")
                ? "active"
                : ""
            }`}
            onClick={closeMenu}
          >
            Contact
          </Link>

          {/* MOBILE FAVORITES */}

          <Link
            to="/favorites"
            className={`navbar-mobile-link ${
              isActive("/favorites")
                ? "active"
                : ""
            }`}
            onClick={closeMenu}
          >
            Favorites

            {favoritesCount > 0 && (
              <span className="navbar-mobile-count">
                {favoritesCount > 99
                  ? "99+"
                  : favoritesCount}
              </span>
            )}
          </Link>

          {/* MOBILE CART */}

          <Link
            to="/cart"
            className={`navbar-mobile-link ${
              isActive("/cart")
                ? "active"
                : ""
            }`}
            onClick={closeMenu}
          >
            Cart

            {cartCount > 0 && (
              <span className="navbar-mobile-count">
                {cartCount > 99
                  ? "99+"
                  : cartCount}
              </span>
            )}
          </Link>

          {/* MOBILE ACCOUNT */}

          <Link
            to={getAccountRoute()}
            className={`navbar-mobile-link ${
              isActive("/account") ||
              isActive("/seller/account") ||
              isActive("/login")
                ? "active"
                : ""
            }`}
            onClick={closeMenu}
          >
            {getAccountLabel()}
          </Link>

        </nav>

      </div>

    </header>
  );
}

export default Navbar;