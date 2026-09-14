import express from "express";

import { authenticateUser } from "../middleware/authMiddleware.js";
import {
  loadUserProfile,
  requireCustomerProfile,
  requireSellerProfile,
  requireAdminProfile,
} from "../middleware/profileMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Base Authentication
|--------------------------------------------------------------------------
|
| Every route in this file first verifies:
| 1. Supabase access token
| 2. User profile
|
*/

router.use(authenticateUser);
router.use(loadUserProfile);

/*
|--------------------------------------------------------------------------
| Current Authenticated User
|--------------------------------------------------------------------------
*/

router.get("/user", (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
    profile: req.profile,
  });
});

/*
|--------------------------------------------------------------------------
| Customer Protected Route
|--------------------------------------------------------------------------
*/

router.get("/customer", requireCustomerProfile, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Customer access granted",
    profile: req.profile,
  });
});

/*
|--------------------------------------------------------------------------
| Seller Protected Route
|--------------------------------------------------------------------------
*/

router.get("/seller", requireSellerProfile, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Seller access granted",
    profile: req.profile,
  });
});

/*
|--------------------------------------------------------------------------
| Admin Protected Route
|--------------------------------------------------------------------------
*/

router.get("/admin", requireAdminProfile, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Admin access granted",
    profile: req.profile,
  });
});

export default router;