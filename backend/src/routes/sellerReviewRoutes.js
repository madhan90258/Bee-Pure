import express from "express";

import {
  getSellerReviews,
  updateSellerReviewVisibility,
  deleteSellerReview,
} from "../controllers/sellerReviewController.js";

import {
  authenticateUser,
} from "../middleware/authMiddleware.js";

import {
  loadUserProfile,
  requireSellerProfile,
} from "../middleware/profileMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| SELLER AUTHENTICATION
|--------------------------------------------------------------------------
*/

router.use(
  authenticateUser
);

router.use(
  loadUserProfile
);

router.use(
  requireSellerProfile
);

/*
|--------------------------------------------------------------------------
| SELLER REVIEWS
|--------------------------------------------------------------------------
*/

// Get seller reviews
router.get(
  "/",
  getSellerReviews
);

// Show / hide review
router.patch(
  "/:id/visibility",
  updateSellerReviewVisibility
);

// Delete review
router.delete(
  "/:id",
  deleteSellerReview
);

export default router;