import express from "express";

import {
  getProfile,
  updateProfile,
} from "../controllers/profileController.js";

import {
  authenticateUser,
} from "../middleware/authMiddleware.js";

import {
  loadUserProfile,
} from "../middleware/profileMiddleware.js";

const router = express.Router();


router.use(
  authenticateUser
);

router.use(
  loadUserProfile
);


router.get(
  "/",
  getProfile
);

router.patch(
  "/",
  updateProfile
);


export default router;