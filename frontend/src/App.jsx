import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollRestoration from "./components/ScrollRestoration";

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetails from "./pages/ProductDetails";
import OurStory from "./pages/OurStory";
import Farmers from "./pages/Farmers";
import Contact from "./pages/Contact";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";

function App() {
  return (
    <BrowserRouter>

      {/* Remember scroll position for each page */}
      <ScrollRestoration />

      {/* Navigation */}
      <Navbar />

      {/* Pages */}
      <Routes>

        {/* Home */}
        <Route
          path="/"
          element={<Home />}
        />

        {/* Shop */}
        <Route
          path="/shop"
          element={<Shop />}
        />

        {/* Product Details */}
        <Route
          path="/product/:id"
          element={<ProductDetails />}
        />

        {/* Our Story */}
        <Route
          path="/our-story"
          element={<OurStory />}
        />

        {/* Farmers */}
        <Route
          path="/farmers"
          element={<Farmers />}
        />

        {/* Contact */}
        <Route
          path="/contact"
          element={<Contact />}
        />

        {/* Cart */}
        <Route
          path="/cart"
          element={<Cart />}
        />

        {/* Checkout */}
        <Route
          path="/checkout"
          element={<Checkout />}
        />

        {/* Login */}
        <Route
          path="/login"
          element={<Login />}
        />

      </Routes>

      {/* Footer */}
      <Footer />

    </BrowserRouter>
  );
}

export default App;