import "dotenv/config";

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";


/*
|--------------------------------------------------------------------------
| ROUTES
|--------------------------------------------------------------------------
*/

import authRoutes from "./routes/authRoutes.js";
import protectedRoutes from "./routes/protectedRoutes.js";

import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import farmerRoutes from "./routes/farmerRoutes.js";

import cartRoutes from "./routes/cartRoutes.js";
import favoriteRoutes from "./routes/favoriteRoutes.js";
import addressRoutes from "./routes/addressRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

import profileRoutes from "./routes/profileRoutes.js";

import sellerRoutes from "./routes/sellerRoutes.js";
import sellerProductRoutes from "./routes/sellerProductRoutes.js";
import sellerOrderRoutes from "./routes/sellerOrderRoutes.js";
import sellerMessageRoutes from "./routes/sellerMessageRoutes.js";
import sellerReviewRoutes from "./routes/sellerReviewRoutes.js";

import couponRoutes from "./routes/couponRoutes.js";

import contactRoutes from "./routes/contactRoutes.js";
import newsletterRoutes from "./routes/newsletterRoutes.js";


/*
|--------------------------------------------------------------------------
| APP
|--------------------------------------------------------------------------
*/

const app = express();

const PORT =
  process.env.PORT || 5000;

const FRONTEND_URL =
  process.env.FRONTEND_URL ||
  "http://localhost:5173";


/*
|--------------------------------------------------------------------------
| SECURITY
|--------------------------------------------------------------------------
*/

app.disable("x-powered-by");

app.use(
  helmet()
);


/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
*/

app.use(
  cors({
    origin:
      FRONTEND_URL,
    credentials: true,
  })
);


/*
|--------------------------------------------------------------------------
| BODY PARSER
|--------------------------------------------------------------------------
*/

app.use(
  express.json({
    limit: "1mb",
  })
);


/*
|--------------------------------------------------------------------------
| RATE LIMITING
|--------------------------------------------------------------------------
*/

const apiLimiter =
  rateLimit({
    windowMs:
      15 * 60 * 1000,

    limit: 100,

    standardHeaders:
      "draft-8",

    legacyHeaders:
      false,

    message: {
      success: false,
      message:
        "Too many requests. Please try again later.",
    },
  });


app.use(
  "/api",
  apiLimiter
);


/*
|--------------------------------------------------------------------------
| HEALTH CHECK
|--------------------------------------------------------------------------
*/

app.get(
  "/api/health",
  (req, res) => {
    res.status(200).json({
      success: true,
      message:
        "Bee Pure API is running",
    });
  }
);


/*
|--------------------------------------------------------------------------
| AUTH
|--------------------------------------------------------------------------
*/

app.use(
  "/api/auth",
  authRoutes
);


/*
|--------------------------------------------------------------------------
| PROTECTED TEST ROUTES
|--------------------------------------------------------------------------
*/

app.use(
  "/api/protected",
  protectedRoutes
);


/*
|--------------------------------------------------------------------------
| PRODUCT CATALOG
|--------------------------------------------------------------------------
*/

app.use(
  "/api/products",
  productRoutes
);

app.use(
  "/api/categories",
  categoryRoutes
);

app.use(
  "/api/farmers",
  farmerRoutes
);


/*
|--------------------------------------------------------------------------
| CUSTOMER SHOPPING
|--------------------------------------------------------------------------
*/

app.use(
  "/api/cart",
  cartRoutes
);

app.use(
  "/api/favorites",
  favoriteRoutes
);

app.use(
  "/api/addresses",
  addressRoutes
);

app.use(
  "/api/orders",
  orderRoutes
);


/*
|--------------------------------------------------------------------------
| CUSTOMER PROFILE
|--------------------------------------------------------------------------
*/

app.use(
  "/api/profile",
  profileRoutes
);


/*
|--------------------------------------------------------------------------
| SELLER
|--------------------------------------------------------------------------
*/

app.use(
  "/api/seller",
  sellerRoutes
);

app.use(
  "/api/seller/products",
  sellerProductRoutes
);

app.use(
  "/api/seller/orders",
  sellerOrderRoutes
);


/*
|--------------------------------------------------------------------------
| COUPONS
|--------------------------------------------------------------------------
*/

app.use(
  "/api/coupons",
  couponRoutes
);


/*
|--------------------------------------------------------------------------
| CONTACT
|--------------------------------------------------------------------------
*/

app.use(
  "/api/contact",
  contactRoutes
);

app.use("/api/seller/messages", sellerMessageRoutes);
app.use(
  "/api/seller/reviews",
  sellerReviewRoutes
);


/*
|--------------------------------------------------------------------------
| NEWSLETTER
|--------------------------------------------------------------------------
*/

app.use(
  "/api/newsletter",
  newsletterRoutes
);


/*
|--------------------------------------------------------------------------
| 404
|--------------------------------------------------------------------------
*/

app.use(
  (req, res) => {
    res.status(404).json({
      success: false,
      message:
        "Route not found",
    });
  }
);


/*
|--------------------------------------------------------------------------
| GLOBAL ERROR HANDLER
|--------------------------------------------------------------------------
*/

app.use(
  (
    err,
    req,
    res,
    next
  ) => {
    console.error(
      "Server error:",
      err
    );

    if (
      res.headersSent
    ) {
      return next(err);
    }

    res.status(500).json({
      success: false,
      message:
        "Internal server error",
    });
  }
);


/*
|--------------------------------------------------------------------------
| START SERVER
|--------------------------------------------------------------------------
*/

app.listen(
  PORT,
  () => {
    console.log(
      `Bee Pure API running at http://localhost:${PORT}`
    );
  }
);