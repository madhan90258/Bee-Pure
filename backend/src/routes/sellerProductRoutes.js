import express from "express";

import {
  getSellerProducts,
  getSellerProductById,
  createSellerProduct,
  updateSellerProduct,
  deleteSellerProduct,
} from "../controllers/sellerProductController.js";

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
| SELLER PRODUCTS
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  getSellerProducts
);

router.get(
  "/:id",
  validate(idParamSchema),
  getSellerProductById
);

router.post(
  "/",
  createSellerProduct
);

router.patch(
  "/:id",
  validate(idParamSchema),
  updateSellerProduct
);

router.delete(
  "/:id",
  validate(idParamSchema),
  deleteSellerProduct
);


export default router;