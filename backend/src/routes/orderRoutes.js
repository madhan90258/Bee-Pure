import express from "express";

import {
  getMyOrders,
  getMyOrderById,
  createOrder,
  cancelMyOrder,
} from "../controllers/orderController.js";

import {
  authenticateUser,
} from "../middleware/authMiddleware.js";

import {
  loadUserProfile,
  requireCustomerProfile,
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
| CUSTOMER AUTHENTICATION
|--------------------------------------------------------------------------
*/

router.use(
  authenticateUser
);

router.use(
  loadUserProfile
);

router.use(
  requireCustomerProfile
);


/*
|--------------------------------------------------------------------------
| ROUTES
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  getMyOrders
);

router.get(
  "/:id",
  validate(
    idParamSchema
  ),
  getMyOrderById
);

router.post(
  "/",
  createOrder
);

router.patch(
  "/:id/cancel",
  validate(
    idParamSchema
  ),
  cancelMyOrder
);

export default router;