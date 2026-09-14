import express from "express";

import {
  subscribeNewsletter,
  unsubscribeNewsletter,
  getNewsletterSubscribers,
} from "../controllers/newsletterController.js";

import {
  authenticateUser,
} from "../middleware/authMiddleware.js";

import {
  loadUserProfile,
  requireAdminProfile,
} from "../middleware/profileMiddleware.js";

const router = express.Router();


/*
|--------------------------------------------------------------------------
| PUBLIC
|--------------------------------------------------------------------------
*/

router.post(
  "/subscribe",
  subscribeNewsletter
);

router.post(
  "/unsubscribe",
  unsubscribeNewsletter
);


/*
|--------------------------------------------------------------------------
| ADMIN
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  authenticateUser,
  loadUserProfile,
  requireAdminProfile,
  getNewsletterSubscribers
);


export default router;