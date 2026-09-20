import express from "express";

import {
  getCategories,
  getCategoryById,
  getCategoryBySlug,
  getSellerCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";

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
| PUBLIC CATEGORY ROUTES
|--------------------------------------------------------------------------
*/


/*
|--------------------------------------------------------------------------
| Get All Active Categories
|--------------------------------------------------------------------------
|
| GET /api/categories
|
*/

router.get(
  "/",
  getCategories
);


/*
|--------------------------------------------------------------------------
| Get Category By Slug
|--------------------------------------------------------------------------
|
| GET /api/categories/slug/:slug
|
*/

router.get(
  "/slug/:slug",
  getCategoryBySlug
);


/*
|--------------------------------------------------------------------------
| SELLER CATEGORY ROUTES
|--------------------------------------------------------------------------
|
| These routes require:
|
| 1. Valid Supabase authentication
| 2. Existing profile
| 3. Seller role
|
*/


router.get(
  "/seller/all",
  authenticateUser,
  loadUserProfile,
  requireSellerProfile,
  getSellerCategories
);


/*
|--------------------------------------------------------------------------
| Create Category
|--------------------------------------------------------------------------
|
| POST /api/categories
|
*/

router.post(
  "/",
  authenticateUser,
  loadUserProfile,
  requireSellerProfile,
  createCategory
);


/*
|--------------------------------------------------------------------------
| Update Category
|--------------------------------------------------------------------------
|
| PATCH /api/categories/:id
|
*/

router.patch(
  "/:id",
  authenticateUser,
  loadUserProfile,
  requireSellerProfile,
  validate(idParamSchema),
  updateCategory
);


/*
|--------------------------------------------------------------------------
| Delete Category
|--------------------------------------------------------------------------
|
| DELETE /api/categories/:id
|
*/

router.delete(
  "/:id",
  authenticateUser,
  loadUserProfile,
  requireSellerProfile,
  validate(idParamSchema),
  deleteCategory
);


/*
|--------------------------------------------------------------------------
| Get Category By ID
|--------------------------------------------------------------------------
|
| GET /api/categories/:id
|
| Keep this AFTER /seller/all and /slug/:slug.
|
*/

router.get(
  "/:id",
  validate(idParamSchema),
  getCategoryById
);


export default router;