import express from "express";
import multer from "multer";

import {
  getSellerProducts,
  getSellerProductById,
  createSellerProduct,
  updateSellerProduct,
  deleteSellerProduct,
  uploadSellerProductImage,
  deleteSellerProductImage,
  setPrimarySellerProductImage,
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


/*
|--------------------------------------------------------------------------
| MULTER
|--------------------------------------------------------------------------
|
| Files are kept in memory temporarily and then uploaded directly
| to Supabase Storage by the controller.
|
*/

const upload = multer({
  storage:
    multer.memoryStorage(),

  limits: {
    fileSize:
      5 * 1024 * 1024,
  },

  fileFilter: (
    req,
    file,
    callback
  ) => {
    const allowedTypes =
      new Set([
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "image/gif",
      ]);

    if (
      allowedTypes.has(
        file.mimetype
      )
    ) {
      callback(
        null,
        true
      );
    } else {
      callback(
        new Error(
          "Only JPG, PNG, WEBP and GIF images are allowed"
        )
      );
    }
  },
});


/*
|--------------------------------------------------------------------------
| AUTHENTICATION
|--------------------------------------------------------------------------
*/

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


/*
|--------------------------------------------------------------------------
| SELLER PRODUCT IMAGES
|--------------------------------------------------------------------------
|
| IMPORTANT:
| These routes are declared BEFORE any potential broad :id route
| handlers you may add later.
|
*/

router.post(
  "/:id/images",
  validate(idParamSchema),
  upload.single("image"),
  uploadSellerProductImage
);

router.delete(
  "/:id/images/:imageId",
  validate(
    idParamSchema.extend({
      imageId:
        idParamSchema.shape.id,
    })
  ),
  deleteSellerProductImage
);

router.patch(
  "/:id/images/:imageId/primary",
  validate(
    idParamSchema.extend({
      imageId:
        idParamSchema.shape.id,
    })
  ),
  setPrimarySellerProductImage
);


/*
|--------------------------------------------------------------------------
| MULTER ERROR HANDLER
|--------------------------------------------------------------------------
*/

router.use(
  (
    err,
    req,
    res,
    next
  ) => {
    if (
      err instanceof
      multer.MulterError
    ) {
      if (
        err.code ===
        "LIMIT_FILE_SIZE"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Image size must be 5 MB or less",
        });
      }

      return res.status(400).json({
        success: false,
        message:
          err.message ||
          "Image upload failed",
      });
    }

    if (
      err?.message?.includes(
        "Only JPG"
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          err.message,
      });
    }

    next(err);
  }
);


export default router;