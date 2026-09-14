import express from "express";

import {
  getSellerOrders,
  getSellerOrderById,
  updateSellerOrderStatus,
} from "../controllers/sellerOrderController.js";

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
| SELLER ORDERS
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  getSellerOrders
);

router.get(
  "/:id",
  validate(idParamSchema),
  getSellerOrderById
);

router.patch(
  "/:id/status",
  validate(idParamSchema),
  updateSellerOrderStatus
);


export default router;