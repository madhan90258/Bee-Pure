import express from "express";

import { getCurrentUser } from "../controllers/authController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";
import { loadUserProfile } from "../middleware/profileMiddleware.js";

const router = express.Router();

router.get(
  "/me",
  authenticateUser,
  loadUserProfile,
  getCurrentUser
);

export default router;