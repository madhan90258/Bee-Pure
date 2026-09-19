import crypto from "crypto";

import { supabaseAdmin } from "../config/supabase.js";

const PRODUCT_IMAGE_BUCKET =
  "product-images";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const getFileExtension = (
  originalName,
  mimeType
) => {
  const fromName =
    originalName
      ?.split(".")
      .pop()
      ?.toLowerCase();

  if (fromName) {
    return fromName;
  }

  const mimeMap = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
  };

  return (
    mimeMap[mimeType] ||
    "jpg"
  );
};

const buildStoragePath = ({
  sellerId,
  productId,
  originalName,
  mimeType,
}) => {
  const extension =
    getFileExtension(
      originalName,
      mimeType
    );

  const uniqueName = `${Date.now()}-${crypto.randomUUID()}.${extension}`;

  return `${sellerId}/${productId}/${uniqueName}`;
};

const getProductForSeller = async (
  productId,
  sellerId
) => {
  const {
    data: product,
    error,
  } = await supabaseAdmin
    .from("products")
    .select("id, seller_id, name")
    .eq("id", productId)
    .eq("seller_id", sellerId)
    .single();

  if (error || !product) {
    return {
      product: null,
      error:
        error ||
        new Error(
          "Product not found"
        ),
    };
  }

  return {
    product,
    error: null,
  };
};


/*
|--------------------------------------------------------------------------
| GET SELLER PRODUCTS
|--------------------------------------------------------------------------
*/
export const getSellerProducts = async (
  req,
  res,
  next
) => {
  try {
    const {
      data: products,
      error,
    } = await supabaseAdmin
      .from("products")
      .select(`
        *,
        categories (
          id,
          name,
          slug
        ),
        farmers (
          id,
          name,
          location
        ),
        product_images (
          id,
          storage_path,
          is_primary,
          created_at
        )
      `)
      .eq(
        "seller_id",
        req.profile.id
      )
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      return res.status(500).json({
        success: false,
        message:
          "Unable to fetch seller products",
      });
    }

    return res.status(200).json({
      success: true,
      products:
        products || [],
    });
  } catch (error) {
    next(error);
  }
};


/*
|--------------------------------------------------------------------------
| GET SELLER PRODUCT
|--------------------------------------------------------------------------
*/
export const getSellerProductById =
  async (
    req,
    res,
    next
  ) => {
    try {
      const { id } =
        req.validated.params;

      const {
        data: product,
        error,
      } = await supabaseAdmin
        .from("products")
        .select(`
          *,
          categories (
            id,
            name,
            slug
          ),
          farmers (
            id,
            name,
            location
          ),
          product_images (
            id,
            storage_path,
            is_primary,
            created_at
          )
        `)
        .eq("id", id)
        .eq(
          "seller_id",
          req.profile.id
        )
        .single();

      if (
        error ||
        !product
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Product not found",
        });
      }

      return res.status(200).json({
        success: true,
        product,
      });
    } catch (error) {
      next(error);
    }
  };


/*
|--------------------------------------------------------------------------
| CREATE SELLER PRODUCT
|--------------------------------------------------------------------------
*/
export const createSellerProduct =
  async (
    req,
    res,
    next
  ) => {
    try {
      const {
        category_id,
        farmer_id,
        name,
        slug,
        description = null,
        price,
        old_price = null,
        stock_quantity = 0,
        rating = 0,
        is_active = true,
      } = req.body;

      if (
        !category_id ||
        !farmer_id ||
        !name?.trim() ||
        !slug?.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "category_id, farmer_id, name and slug are required",
        });
      }

      const numericPrice =
        Number(price);

      if (
        !Number.isFinite(
          numericPrice
        ) ||
        numericPrice <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Price must be greater than 0",
        });
      }

      const numericStock =
        Number(stock_quantity);

      if (
        !Number.isInteger(
          numericStock
        ) ||
        numericStock < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Stock quantity must be a non-negative integer",
        });
      }

      let numericOldPrice =
        null;

      if (
        old_price !==
          null &&
        old_price !==
          undefined &&
        old_price !== ""
      ) {
        numericOldPrice =
          Number(old_price);

        if (
          !Number.isFinite(
            numericOldPrice
          ) ||
          numericOldPrice < 0
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid old price",
          });
        }
      }

      const numericRating =
        Number(rating);

      if (
        !Number.isFinite(
          numericRating
        ) ||
        numericRating < 0 ||
        numericRating > 5
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Rating must be between 0 and 5",
        });
      }

      const {
        data: product,
        error,
      } = await supabaseAdmin
        .from("products")
        .insert({
          category_id,
          farmer_id,
          seller_id:
            req.profile.id,
          name: name.trim(),
          slug: slug.trim(),
          description,
          price: numericPrice,
          old_price:
            numericOldPrice,
          stock_quantity:
            numericStock,
          rating:
            numericRating,
          is_active:
            Boolean(is_active),
        })
        .select("*")
        .single();

      if (error) {
        if (
          error.code ===
          "23505"
        ) {
          return res.status(409).json({
            success: false,
            message:
              "Product slug already exists",
          });
        }

        return res.status(400).json({
          success: false,
          message:
            error.message ||
            "Unable to create product",
        });
      }

      return res.status(201).json({
        success: true,
        message:
          "Product created successfully",
        product,
      });
    } catch (error) {
      next(error);
    }
  };


/*
|--------------------------------------------------------------------------
| UPDATE SELLER PRODUCT
|--------------------------------------------------------------------------
*/
export const updateSellerProduct =
  async (
    req,
    res,
    next
  ) => {
    try {
      const { id } =
        req.validated.params;

      const {
        category_id,
        farmer_id,
        name,
        slug,
        description,
        price,
        old_price,
        stock_quantity,
        rating,
        is_active,
      } = req.body;

      const updates = {};

      if (
        category_id !==
        undefined
      ) {
        updates.category_id =
          category_id;
      }

      if (
        farmer_id !==
        undefined
      ) {
        updates.farmer_id =
          farmer_id;
      }

      if (
        name !== undefined
      ) {
        if (
          typeof name !==
            "string" ||
          !name.trim()
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Product name cannot be empty",
          });
        }

        updates.name =
          name.trim();
      }

      if (
        slug !== undefined
      ) {
        if (
          typeof slug !==
            "string" ||
          !slug.trim()
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Product slug cannot be empty",
          });
        }

        updates.slug =
          slug.trim();
      }

      if (
        description !==
        undefined
      ) {
        updates.description =
          description;
      }

      if (
        price !== undefined
      ) {
        const value =
          Number(price);

        if (
          !Number.isFinite(
            value
          ) ||
          value <= 0
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Price must be greater than 0",
          });
        }

        updates.price =
          value;
      }

      if (
        old_price !==
        undefined
      ) {
        if (
          old_price === null ||
          old_price === ""
        ) {
          updates.old_price =
            null;
        } else {
          const value =
            Number(old_price);

          if (
            !Number.isFinite(
              value
            ) ||
            value < 0
          ) {
            return res.status(400).json({
              success: false,
              message:
                "Invalid old price",
            });
          }

          updates.old_price =
            value;
        }
      }

      if (
        stock_quantity !==
        undefined
      ) {
        const value =
          Number(stock_quantity);

        if (
          !Number.isInteger(
            value
          ) ||
          value < 0
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Stock quantity must be a non-negative integer",
          });
        }

        updates.stock_quantity =
          value;
      }

      if (
        rating !== undefined
      ) {
        const value =
          Number(rating);

        if (
          !Number.isFinite(
            value
          ) ||
          value < 0 ||
          value > 5
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Rating must be between 0 and 5",
          });
        }

        updates.rating =
          value;
      }

      if (
        is_active !==
        undefined
      ) {
        if (
          typeof is_active !==
          "boolean"
        ) {
          return res.status(400).json({
            success: false,
            message:
              "is_active must be a boolean",
          });
        }

        updates.is_active =
          is_active;
      }

      if (
        Object.keys(
          updates
        ).length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "No fields provided for update",
        });
      }

      updates.updated_at =
        new Date().toISOString();

      const {
        data: product,
        error,
      } = await supabaseAdmin
        .from("products")
        .update(updates)
        .eq("id", id)
        .eq(
          "seller_id",
          req.profile.id
        )
        .select("*")
        .single();

      if (
        error ||
        !product
      ) {
        if (
          error?.code ===
          "23505"
        ) {
          return res.status(409).json({
            success: false,
            message:
              "Product slug already exists",
          });
        }

        return res.status(404).json({
          success: false,
          message:
            "Product not found or update failed",
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Product updated successfully",
        product,
      });
    } catch (error) {
      next(error);
    }
  };


/*
|--------------------------------------------------------------------------
| DELETE / DEACTIVATE SELLER PRODUCT
|--------------------------------------------------------------------------
*/
export const deleteSellerProduct =
  async (
    req,
    res,
    next
  ) => {
    try {
      const { id } =
        req.validated.params;

      const {
        data: product,
        error,
      } = await supabaseAdmin
        .from("products")
        .update({
          is_active: false,
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", id)
        .eq(
          "seller_id",
          req.profile.id
        )
        .select("*")
        .single();

      if (
        error ||
        !product
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Product not found",
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Product deactivated successfully",
        product,
      });
    } catch (error) {
      next(error);
    }
  };


/*
|--------------------------------------------------------------------------
| UPLOAD SELLER PRODUCT IMAGE
|--------------------------------------------------------------------------
*/
export const uploadSellerProductImage =
  async (
    req,
    res,
    next
  ) => {
    try {
      const { id } =
        req.validated.params;

      const {
        product,
        error: productError,
      } =
        await getProductForSeller(
          id,
          req.profile.id
        );

      if (
        productError ||
        !product
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Product not found",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message:
            "Product image is required",
        });
      }

      if (
        !ALLOWED_IMAGE_TYPES.has(
          req.file.mimetype
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Only JPG, PNG, WEBP and GIF images are allowed",
        });
      }

      if (
        req.file.size >
        MAX_IMAGE_SIZE
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Image size must be 5 MB or less",
        });
      }

      const requestedPrimary =
        String(
          req.body?.is_primary
        ).toLowerCase() ===
        "true";

      const {
        data: existingImages,
        error: existingImagesError,
      } = await supabaseAdmin
        .from("product_images")
        .select(
          "id, storage_path, is_primary"
        )
        .eq(
          "product_id",
          product.id
        )
        .order(
          "created_at",
          {
            ascending: true,
          }
        );

      if (
        existingImagesError
      ) {
        return res.status(500).json({
          success: false,
          message:
            "Unable to inspect existing product images",
        });
      }

      const shouldBePrimary =
        requestedPrimary ||
        !existingImages ||
        existingImages.length ===
          0;

      const storagePath =
        buildStoragePath({
          sellerId:
            req.profile.id,
          productId:
            product.id,
          originalName:
            req.file.originalname,
          mimeType:
            req.file.mimetype,
        });

      const {
        data: uploadedFile,
        error: uploadError,
      } = await supabaseAdmin.storage
        .from(
          PRODUCT_IMAGE_BUCKET
        )
        .upload(
          storagePath,
          req.file.buffer,
          {
            contentType:
              req.file.mimetype,
            cacheControl:
              "3600",
            upsert: false,
          }
        );

      if (
        uploadError ||
        !uploadedFile
      ) {
        return res.status(500).json({
          success: false,
          message:
            uploadError?.message ||
            "Unable to upload product image",
        });
      }

      if (shouldBePrimary) {
        const {
          error:
            primaryResetError,
        } = await supabaseAdmin
          .from("product_images")
          .update({
            is_primary:
              false,
          })
          .eq(
            "product_id",
            product.id
          );

        if (
          primaryResetError
        ) {
          await supabaseAdmin.storage
            .from(
              PRODUCT_IMAGE_BUCKET
            )
            .remove([
              storagePath,
            ]);

          return res.status(500).json({
            success: false,
            message:
              "Unable to update primary image",
          });
        }
      }

      const {
        data: image,
        error:
          imageInsertError,
      } = await supabaseAdmin
        .from("product_images")
        .insert({
          product_id:
            product.id,
          storage_path:
            uploadedFile.path,
          is_primary:
            shouldBePrimary,
        })
        .select(
          "id, product_id, storage_path, is_primary, created_at"
        )
        .single();

      if (
        imageInsertError ||
        !image
      ) {
        await supabaseAdmin.storage
          .from(
            PRODUCT_IMAGE_BUCKET
          )
          .remove([
            storagePath,
          ]);

        return res.status(500).json({
          success: false,
          message:
            imageInsertError?.message ||
            "Unable to save product image",
        });
      }

      const {
        data: publicUrlData,
      } = supabaseAdmin.storage
        .from(
          PRODUCT_IMAGE_BUCKET
        )
        .getPublicUrl(
          image.storage_path
        );

      return res.status(201).json({
        success: true,
        message:
          "Product image uploaded successfully",
        image: {
          ...image,
          public_url:
            publicUrlData?.publicUrl ||
            null,
        },
      });
    } catch (error) {
      next(error);
    }
  };


/*
|--------------------------------------------------------------------------
| DELETE SELLER PRODUCT IMAGE
|--------------------------------------------------------------------------
*/
export const deleteSellerProductImage =
  async (
    req,
    res,
    next
  ) => {
    try {
      const {
        id,
        imageId,
      } = req.validated.params;

      const {
        product,
        error: productError,
      } =
        await getProductForSeller(
          id,
          req.profile.id
        );

      if (
        productError ||
        !product
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Product not found",
        });
      }

      const {
        data: image,
        error: imageError,
      } = await supabaseAdmin
        .from("product_images")
        .select(
          "id, product_id, storage_path, is_primary"
        )
        .eq("id", imageId)
        .eq(
          "product_id",
          product.id
        )
        .single();

      if (
        imageError ||
        !image
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Product image not found",
        });
      }

      const {
        error: deleteStorageError,
      } = await supabaseAdmin.storage
        .from(
          PRODUCT_IMAGE_BUCKET
        )
        .remove([
          image.storage_path,
        ]);

      if (
        deleteStorageError
      ) {
        return res.status(500).json({
          success: false,
          message:
            deleteStorageError.message ||
            "Unable to delete image from storage",
        });
      }

      const {
        error: deleteDbError,
      } = await supabaseAdmin
        .from("product_images")
        .delete()
        .eq("id", image.id)
        .eq(
          "product_id",
          product.id
        );

      if (deleteDbError) {
        return res.status(500).json({
          success: false,
          message:
            deleteDbError.message ||
            "Unable to delete product image",
        });
      }

      /*
       * If the deleted image was primary,
       * promote the oldest remaining image.
       */
      if (image.is_primary) {
        const {
          data: remainingImages,
          error:
            remainingError,
        } = await supabaseAdmin
          .from("product_images")
          .select(
            "id, storage_path, is_primary"
          )
          .eq(
            "product_id",
            product.id
          )
          .order(
            "created_at",
            {
              ascending: true,
            }
          )
          .limit(1);

        if (
          !remainingError &&
          remainingImages?.length
        ) {
          await supabaseAdmin
            .from("product_images")
            .update({
              is_primary:
                true,
            })
            .eq(
              "id",
              remainingImages[0]
                .id
            );
        }
      }

      return res.status(200).json({
        success: true,
        message:
          "Product image deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  };


/*
|--------------------------------------------------------------------------
| SET PRIMARY SELLER PRODUCT IMAGE
|--------------------------------------------------------------------------
*/
export const setPrimarySellerProductImage =
  async (
    req,
    res,
    next
  ) => {
    try {
      const {
        id,
        imageId,
      } = req.validated.params;

      const {
        product,
        error: productError,
      } =
        await getProductForSeller(
          id,
          req.profile.id
        );

      if (
        productError ||
        !product
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Product not found",
        });
      }

      const {
        data: image,
        error: imageError,
      } = await supabaseAdmin
        .from("product_images")
        .select(
          "id, product_id, storage_path"
        )
        .eq("id", imageId)
        .eq(
          "product_id",
          product.id
        )
        .single();

      if (
        imageError ||
        !image
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Product image not found",
        });
      }

      const {
        error: resetError,
      } = await supabaseAdmin
        .from("product_images")
        .update({
          is_primary:
            false,
        })
        .eq(
          "product_id",
          product.id
        );

      if (resetError) {
        return res.status(500).json({
          success: false,
          message:
            resetError.message ||
            "Unable to reset primary image",
        });
      }

      const {
        data: updatedImage,
        error: updateError,
      } = await supabaseAdmin
        .from("product_images")
        .update({
          is_primary:
            true,
        })
        .eq(
          "id",
          image.id
        )
        .eq(
          "product_id",
          product.id
        )
        .select(
          "id, product_id, storage_path, is_primary, created_at"
        )
        .single();

      if (
        updateError ||
        !updatedImage
      ) {
        return res.status(500).json({
          success: false,
          message:
            updateError?.message ||
            "Unable to set primary image",
        });
      }

      const {
        data: publicUrlData,
      } = supabaseAdmin.storage
        .from(
          PRODUCT_IMAGE_BUCKET
        )
        .getPublicUrl(
          updatedImage.storage_path
        );

      return res.status(200).json({
        success: true,
        message:
          "Primary image updated successfully",
        image: {
          ...updatedImage,
          public_url:
            publicUrlData?.publicUrl ||
            null,
        },
      });
    } catch (error) {
      next(error);
    }
  };