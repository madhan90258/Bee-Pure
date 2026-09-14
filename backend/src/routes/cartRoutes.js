import express from "express";

import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../controllers/cartController.js";

import { authenticateUser } from "../middleware/authMiddleware.js";

import {
  loadUserProfile,
  requireCustomerProfile,
} from "../middleware/profileMiddleware.js";

import { validate } from "../middleware/validateMiddleware.js";
import { idParamSchema } from "../utils/validation/commonSchemas.js";

const router = express.Router();

// --------------------------------------------------
// AUTHENTICATION
// --------------------------------------------------

router.use(authenticateUser);

// --------------------------------------------------
// LOAD USER PROFILE
// --------------------------------------------------

router.use(loadUserProfile);

// --------------------------------------------------
// CUSTOMER AUTHORIZATION
// --------------------------------------------------

router.use(requireCustomerProfile);

// --------------------------------------------------
// GET CURRENT USER CART
// --------------------------------------------------

router.get("/", getCart);

// --------------------------------------------------
// ADD PRODUCT TO CART
// --------------------------------------------------

router.post("/", addToCart);

// --------------------------------------------------
// UPDATE CART ITEM QUANTITY
// --------------------------------------------------

router.patch(
  "/:id",
  validate(idParamSchema),
  updateCartItem
);

// --------------------------------------------------
// REMOVE PRODUCT FROM CART
// --------------------------------------------------

router.delete(
  "/:id",
  validate(idParamSchema),
  removeFromCart
);

// --------------------------------------------------
// CLEAR ENTIRE CART
// --------------------------------------------------

router.delete("/", clearCart);

export default router;