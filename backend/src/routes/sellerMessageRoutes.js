import express from "express";

import {
  getSellerMessages,
  updateSellerMessageStatus,
  deleteSellerMessage,
} from "../controllers/sellerMessageController.js";

import { authenticateUser } from "../middleware/authMiddleware.js";

import {
  loadUserProfile,
  requireSellerProfile,
} from "../middleware/profileMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Seller authentication
|--------------------------------------------------------------------------
*/

router.use(authenticateUser);
router.use(loadUserProfile);
router.use(requireSellerProfile);

/*
|--------------------------------------------------------------------------
| Seller Messages
|--------------------------------------------------------------------------
*/

// Get all customer messages
router.get("/", getSellerMessages);

// Update message status
router.patch(
  "/:id/status",
  updateSellerMessageStatus
);

// Delete message
router.delete(
  "/:id",
  deleteSellerMessage
);

export default router;