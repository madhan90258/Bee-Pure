import express from "express";

import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../controllers/addressController.js";

import { authenticateUser } from "../middleware/authMiddleware.js";

import {
  loadUserProfile,
  requireCustomerProfile,
} from "../middleware/profileMiddleware.js";

import { validate } from "../middleware/validateMiddleware.js";

import {
  idParamSchema,
} from "../utils/validation/commonSchemas.js";

const router = express.Router();

/* =========================================
   AUTHENTICATION
========================================= */

router.use(authenticateUser);

router.use(loadUserProfile);

router.use(requireCustomerProfile);


/* =========================================
   GET ALL ADDRESSES
========================================= */

router.get(
  "/",
  getAddresses
);


/* =========================================
   CREATE ADDRESS
========================================= */

router.post(
  "/",
  createAddress
);


/* =========================================
   SET DEFAULT ADDRESS

   IMPORTANT:
   This must come BEFORE /:id
========================================= */

router.patch(
  "/:id/default",
  validate(idParamSchema),
  setDefaultAddress
);


/* =========================================
   UPDATE ADDRESS
========================================= */

router.patch(
  "/:id",
  validate(idParamSchema),
  updateAddress
);


/* =========================================
   DELETE ADDRESS
========================================= */

router.delete(
  "/:id",
  validate(idParamSchema),
  deleteAddress
);

export default router;