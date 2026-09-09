import {
  BrowserRouter,
  Routes,
  Route,
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
import Account from "./pages/Account";

import SellerDashboard from "./pages/SellerDashboard";
import SellerProducts from "./pages/SellerProducts";
import SellerCategories from "./pages/SellerCategories";
import SellerOrders from "./pages/SellerOrders";
import SellerCoupons from "./pages/SellerCoupons";
import SellerMessages from "./pages/SellerMessages";
import SellerReviews from "./pages/SellerReviews";
import SellerAccount from "./pages/SellerAccount";

function App() {
  return (
    <BrowserRouter>

      <Navbar />

      <Routes>

        {/* =========================
            CUSTOMER PAGES
        ========================= */}

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

        <Route
          path="/cart"
          element={<Cart />}
        />

        <Route
          path="/checkout"
          element={<Checkout />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/account"
          element={<Account />}
        />


        {/* =========================
            SELLER PAGES
        ========================= */}

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
          path="/seller/orders"
          element={<SellerOrders />}
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
          path="/seller/account"
          element={<SellerAccount />}
        />

      </Routes>

      <Footer />

    </BrowserRouter>
  );
}

export default App;