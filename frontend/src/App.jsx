import { useEffect } from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

// =========================================
// COMPONENTS
// =========================================

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import RoleProtectedRoute from "./components/RoleProtectedRoute";

// =========================================
// CUSTOMER / PUBLIC PAGES
// =========================================

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetails from "./pages/ProductDetails";
import OurStory from "./pages/OurStory";
import Farmers from "./pages/Farmers";
import Contact from "./pages/Contact";

// =========================================
// SHOPPING
// =========================================

import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Favorites from "./pages/Favorites";

// =========================================
// AUTHENTICATION
// =========================================

import Login from "./pages/Login";
import Signup from "./pages/Signup";

// =========================================
// CUSTOMER ACCOUNT
// =========================================

import Account from "./pages/Account";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import Addresses from "./pages/Addresses";

// =========================================
// SELLER PAGES
// =========================================

import SellerDashboard from "./pages/SellerDashboard";
import SellerProducts from "./pages/SellerProducts";
import SellerCategories from "./pages/SellerCategories";
import SellerCoupons from "./pages/SellerCoupons";
import SellerMessages from "./pages/SellerMessages";
import SellerReviews from "./pages/SellerReviews";
import SellerOrders from "./pages/SellerOrders";
import SellerAccount from "./pages/SellerAccount";

// =========================================
// SCROLL TO TOP
// =========================================

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  }, [pathname]);

  return null;
}

// =========================================
// APP
// =========================================

function App() {
  return (
    <BrowserRouter basename="/Bee-Pure">

      <ScrollToTop />

      <Navbar />

      <Routes>

        {/* =================================
            PUBLIC PAGES
        ================================== */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/shop"
          element={<Shop />}
        />

        <Route
          path="/product/:id"
          element={<ProductDetails />}
        />

        <Route
          path="/our-story"
          element={<OurStory />}
        />

        <Route
          path="/farmers"
          element={<Farmers />}
        />

        <Route
          path="/contact"
          element={<Contact />}
        />

        {/* =================================
            SHOPPING
        ================================== */}

        <Route
          path="/cart"
          element={<Cart />}
        />

        <Route
          path="/checkout"
          element={<Checkout />}
        />

        <Route
          path="/favorites"
          element={<Favorites />}
        />

        {/* =================================
            AUTHENTICATION
        ================================== */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />

        {/* =================================
            CUSTOMER ACCOUNT
        ================================== */}

        <Route
          path="/account"
          element={
            <RoleProtectedRoute
              allowedRole="customer"
            >
              <Account />
            </RoleProtectedRoute>
          }
        />

        {/* =================================
            CUSTOMER ORDERS
        ================================== */}

        <Route
          path="/orders"
          element={
            <RoleProtectedRoute
              allowedRole="customer"
            >
              <Orders />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/orders/:id"
          element={
            <RoleProtectedRoute
              allowedRole="customer"
            >
              <OrderDetails />
            </RoleProtectedRoute>
          }
        />

        {/* =================================
            CUSTOMER ADDRESSES
        ================================== */}

        <Route
          path="/addresses"
          element={
            <RoleProtectedRoute
              allowedRole="customer"
            >
              <Addresses />
            </RoleProtectedRoute>
          }
        />

        {/* =================================
            SELLER DASHBOARD
        ================================== */}

        <Route
          path="/seller/dashboard"
          element={
            <RoleProtectedRoute
              allowedRole="seller"
            >
              <SellerDashboard />
            </RoleProtectedRoute>
          }
        />

        {/* =================================
            SELLER PRODUCTS
        ================================== */}

        <Route
          path="/seller/products"
          element={
            <RoleProtectedRoute
              allowedRole="seller"
            >
              <SellerProducts />
            </RoleProtectedRoute>
          }
        />

        {/* =================================
            SELLER CATEGORIES
        ================================== */}

        <Route
          path="/seller/categories"
          element={
            <RoleProtectedRoute
              allowedRole="seller"
            >
              <SellerCategories />
            </RoleProtectedRoute>
          }
        />

        {/* =================================
            SELLER COUPONS
        ================================== */}

        <Route
          path="/seller/coupons"
          element={
            <RoleProtectedRoute
              allowedRole="seller"
            >
              <SellerCoupons />
            </RoleProtectedRoute>
          }
        />

        {/* =================================
            SELLER MESSAGES
        ================================== */}

        <Route
          path="/seller/messages"
          element={
            <RoleProtectedRoute
              allowedRole="seller"
            >
              <SellerMessages />
            </RoleProtectedRoute>
          }
        />

        {/* =================================
            SELLER REVIEWS
        ================================== */}

        <Route
          path="/seller/reviews"
          element={
            <RoleProtectedRoute
              allowedRole="seller"
            >
              <SellerReviews />
            </RoleProtectedRoute>
          }
        />

        {/* =================================
            SELLER ORDERS
        ================================== */}

        <Route
          path="/seller/orders"
          element={
            <RoleProtectedRoute
              allowedRole="seller"
            >
              <SellerOrders />
            </RoleProtectedRoute>
          }
        />

        {/* =================================
            SELLER ACCOUNT
        ================================== */}

        <Route
          path="/seller/account"
          element={
            <RoleProtectedRoute
              allowedRole="seller"
            >
              <SellerAccount />
            </RoleProtectedRoute>
          }
        />

      </Routes>

      <Footer />

    </BrowserRouter>
  );
}

export default App;