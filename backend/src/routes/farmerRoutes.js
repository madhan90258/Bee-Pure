import express from "express";

import {
  getFarmers,
  getFarmerById,
} from "../controllers/farmerController.js";

import { validate } from "../middleware/validateMiddleware.js";
import { idParamSchema } from "../utils/validation/commonSchemas.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Get All Farmers
|--------------------------------------------------------------------------
|
| GET /api/farmers
|
*/

router.get("/", getFarmers);

/*
|--------------------------------------------------------------------------
| Get Farmer By ID
|--------------------------------------------------------------------------
|
| GET /api/farmers/:id
|
*/

router.get(
  "/:id",
  validate(idParamSchema),
  getFarmerById
);

export default router;