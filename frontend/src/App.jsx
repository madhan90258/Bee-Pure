import { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetails from "./pages/ProductDetails";
import OurStory from "./pages/OurStory";
import Farmers from "./pages/Farmers";
import Contact from "./pages/Contact";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Account from "./pages/Account";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import Addresses from "./pages/Addresses";
import Favorites from "./pages/Favorites";

import SellerDashboard from "./pages/SellerDashboard";
import SellerProducts from "./pages/SellerProducts";
import SellerCategories from "./pages/SellerCategories";
import SellerCoupons from "./pages/SellerCoupons";
import SellerMessages from "./pages/SellerMessages";
import SellerReviews from "./pages/SellerReviews";
import SellerOrders from "./pages/SellerOrders";
import SellerAccount from "./pages/SellerAccount";

// -----------------------------------------
// Scroll to top whenever route changes
// -----------------------------------------

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

// -----------------------------------------
// APP
// -----------------------------------------

function App() {
  return (
    <BrowserRouter basename="/Bee-Pure">
      <ScrollToTop />

      <Navbar />

      <Routes>

        {/* =================================
            CUSTOMER PAGES
        ================================== */}

        <Route path="/" element={<Home />} />

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

        {/* =================================
            ACCOUNT / AUTHENTICATION
        ================================== */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />

        <Route
          path="/account"
          element={<Account />}
        />

        <Route
          path="/favorites"
          element={<Favorites />}
        />

        {/* =================================
            SELLER DASHBOARD
        ================================== */}

        <Route
          path="/seller/dashboard"
          element={<SellerDashboard />}
        />

        <Route
          path="/seller/products"
          element={<SellerProducts />}
        />

        <Route
          path="/seller/categories"
          element={<SellerCategories />}
        />

        <Route
          path="/seller/coupons"
          element={<SellerCoupons />}
        />

        <Route
          path="/seller/messages"
          element={<SellerMessages />}
        />

        <Route
          path="/seller/reviews"
          element={<SellerReviews />}
        />

        <Route
          path="/seller/orders"
          element={<SellerOrders />}
        />

        <Route
          path="/seller/account"
          element={<SellerAccount />}
        />

        <Route
         path="/orders"
         element={<Orders />}
        />

        <Route path="/orders/:id" element={<OrderDetails />} />

        <Route path="/addresses" element={<Addresses />} />

      </Routes>

      <Footer />
    </BrowserRouter>
  );
}

export default App;