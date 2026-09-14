import express from "express";

import {
  createContactMessage,
  getContactMessages,
  updateContactStatus,
} from "../controllers/contactController.js";

import {
  authenticateUser,
} from "../middleware/authMiddleware.js";

import {
  loadUserProfile,
  requireAdminProfile,
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
| PUBLIC
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  createContactMessage
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
  getContactMessages
);

router.patch(
  "/:id/status",
  authenticateUser,
  loadUserProfile,
  requireAdminProfile,
  validate(idParamSchema),
  updateContactStatus
);


export default router;