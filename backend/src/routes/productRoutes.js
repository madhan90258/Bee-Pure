import express from "express";

import {
  getProducts,
  getProductById,
  getProductBySlug,
} from "../controllers/productController.js";

import { validate } from "../middleware/validateMiddleware.js";
import { idParamSchema } from "../utils/validation/commonSchemas.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Get All Products
|--------------------------------------------------------------------------
*/

router.get("/", getProducts);

/*
|--------------------------------------------------------------------------
| Get Product By Slug
|--------------------------------------------------------------------------
|
| IMPORTANT:
| This route comes BEFORE /:id.
|
*/

router.get(
  "/slug/:slug",
  getProductBySlug
);

/*
|--------------------------------------------------------------------------
| Get Product By ID
|--------------------------------------------------------------------------
*/

router.get(
  "/:id",
  validate(idParamSchema),
  getProductById
);

export default router;