import express from "express";

import {
  getSellerDashboard,
} from "../controllers/sellerController.js";

import {
  authenticateUser,
} from "../middleware/authMiddleware.js";

import {
  loadUserProfile,
  requireSellerProfile,
} from "../middleware/profileMiddleware.js";

const router = express.Router();


router.use(
  authenticateUser
);

router.use(
  loadUserProfile
);

router.use(
  requireSellerProfile
);


router.get(
  "/dashboard",
  getSellerDashboard
);


export default router;