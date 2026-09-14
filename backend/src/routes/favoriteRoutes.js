import express from "express";

import {
  getFavorites,
  addToFavorites,
  removeFromFavorites,
  clearFavorites,
} from "../controllers/favoriteController.js";

import { authenticateUser } from "../middleware/authMiddleware.js";

import {
  loadUserProfile,
  requireCustomerProfile,
} from "../middleware/profileMiddleware.js";

import { validate } from "../middleware/validateMiddleware.js";
import { idParamSchema } from "../utils/validation/commonSchemas.js";

const router = express.Router();

// Authentication + customer authorization
router.use(authenticateUser);
router.use(loadUserProfile);
router.use(requireCustomerProfile);

// Get all favorites
router.get("/", getFavorites);

// Add product to favorites
router.post("/", addToFavorites);

// Remove a specific product from favorites
router.delete(
  "/:id",
  validate(idParamSchema),
  removeFromFavorites
);

// Clear all favorites
router.delete("/", clearFavorites);

export default router;