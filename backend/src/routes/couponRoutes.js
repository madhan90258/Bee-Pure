import express from "express";

import {
  getActiveCoupons,
  validateCoupon,
  getSellerCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from "../controllers/couponController.js";

import {
  authenticateUser,
} from "../middleware/authMiddleware.js";

import {
  loadUserProfile,
  requireSellerProfile,
} from "../middleware/profileMiddleware.js";

import {
  validate,
} from "../middleware/validateMiddleware.js";

import {
  idParamSchema,
} from "../utils/validation/commonSchemas.js";

const router = express.Router();


/*
|--------------------------------------------------------------------------
| PUBLIC / CUSTOMER COUPON ROUTES
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  getActiveCoupons
);

router.post(
  "/validate",
  validateCoupon
);


/*
|--------------------------------------------------------------------------
| SELLER COUPON ROUTES
|--------------------------------------------------------------------------
*/

router.get(
  "/seller",
  authenticateUser,
  loadUserProfile,
  requireSellerProfile,
  getSellerCoupons
);

router.post(
  "/seller",
  authenticateUser,
  loadUserProfile,
  requireSellerProfile,
  createCoupon
);

router.patch(
  "/seller/:id",
  authenticateUser,
  loadUserProfile,
  requireSellerProfile,
  validate(idParamSchema),
  updateCoupon
);

router.delete(
  "/seller/:id",
  authenticateUser,
  loadUserProfile,
  requireSellerProfile,
  validate(idParamSchema),
  deleteCoupon
);

export default router;