import express from "express";

import {
  getCategories,
  getCategoryById,
  getCategoryBySlug,
} from "../controllers/categoryController.js";

import { validate } from "../middleware/validateMiddleware.js";
import { idParamSchema } from "../utils/validation/commonSchemas.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Get All Categories
|--------------------------------------------------------------------------
|
| GET /api/categories
|
*/

router.get("/", getCategories);

/*
|--------------------------------------------------------------------------
| Get Category By Slug
|--------------------------------------------------------------------------
|
| GET /api/categories/slug/:slug
|
| IMPORTANT:
| This route comes before /:id.
|
*/

router.get(
  "/slug/:slug",
  getCategoryBySlug
);

/*
|--------------------------------------------------------------------------
| Get Category By ID
|--------------------------------------------------------------------------
|
| GET /api/categories/:id
|
*/

router.get(
  "/:id",
  validate(idParamSchema),
  getCategoryById
);

export default router;