import { supabaseAdmin } from "../config/supabase.js";


/*
|--------------------------------------------------------------------------
| GET ACTIVE COUPONS
|--------------------------------------------------------------------------
*/
export const getActiveCoupons = async (
  req,
  res,
  next
) => {
  try {
    const now = new Date().toISOString();

    const {
      data: coupons,
      error,
    } = await supabaseAdmin
      .from("coupons")
      .select(`
        id,
        code,
        discount_type,
        discount_value,
        minimum_order_amount,
        maximum_discount,
        usage_limit,
        used_count,
        starts_at,
        expires_at,
        is_active
      `)
      .eq("is_active", true)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      return res.status(500).json({
        success: false,
        message:
          "Unable to fetch coupons",
      });
    }

    const activeCoupons =
      (coupons || []).filter((coupon) => {
        const started =
          !coupon.starts_at ||
          new Date(coupon.starts_at) <=
            new Date(now);

        const notExpired =
          !coupon.expires_at ||
          new Date(coupon.expires_at) >=
            new Date(now);

        const hasUsage =
          coupon.usage_limit === null ||
          coupon.used_count <
            coupon.usage_limit;

        return (
          started &&
          notExpired &&
          hasUsage
        );
      });

    return res.status(200).json({
      success: true,
      coupons: activeCoupons,
    });
  } catch (error) {
    next(error);
  }
};


/*
|--------------------------------------------------------------------------
| VALIDATE COUPON
|--------------------------------------------------------------------------
*/
export const validateCoupon = async (
  req,
  res,
  next
) => {
  try {
    const {
      code,
      subtotal,
    } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message:
          "Coupon code is required",
      });
    }

    const numericSubtotal =
      Number(subtotal);

    if (
      !Number.isFinite(numericSubtotal) ||
      numericSubtotal < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Valid subtotal is required",
      });
    }

    const {
      data: coupon,
      error,
    } = await supabaseAdmin
      .from("coupons")
      .select("*")
      .ilike("code", code.trim())
      .eq("is_active", true)
      .maybeSingle();

    if (error) {
      return res.status(500).json({
        success: false,
        message:
          "Unable to validate coupon",
      });
    }

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message:
          "Invalid coupon code",
      });
    }

    const now = new Date();

    if (
      coupon.starts_at &&
      new Date(coupon.starts_at) > now
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Coupon is not active yet",
      });
    }

    if (
      coupon.expires_at &&
      new Date(coupon.expires_at) < now
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Coupon has expired",
      });
    }

    if (
      coupon.usage_limit !== null &&
      coupon.used_count >=
        coupon.usage_limit
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Coupon usage limit reached",
      });
    }

    if (
      numericSubtotal <
      Number(coupon.minimum_order_amount)
    ) {
      return res.status(400).json({
        success: false,
        message:
          `Minimum order amount is ₹${coupon.minimum_order_amount}`,
      });
    }

    let discount = 0;

    if (
      coupon.discount_type ===
      "percentage"
    ) {
      discount =
        numericSubtotal *
        (Number(coupon.discount_value) /
          100);

      if (
        coupon.maximum_discount !==
          null &&
        discount >
          Number(coupon.maximum_discount)
      ) {
        discount =
          Number(coupon.maximum_discount);
      }
    } else {
      discount =
        Number(coupon.discount_value);
    }

    discount = Math.min(
      discount,
      numericSubtotal
    );

    discount = Math.max(
      discount,
      0
    );

    discount =
      Math.round(discount * 100) /
      100;

    return res.status(200).json({
      success: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discount_type:
          coupon.discount_type,
        discount_value:
          coupon.discount_value,
        minimum_order_amount:
          coupon.minimum_order_amount,
        maximum_discount:
          coupon.maximum_discount,
      },
      discount,
      subtotal: numericSubtotal,
      total_after_discount:
        Math.max(
          numericSubtotal -
            discount,
          0
        ),
    });
  } catch (error) {
    next(error);
  }
};


/*
|--------------------------------------------------------------------------
| SELLER - GET OWN COUPONS
|--------------------------------------------------------------------------
*/
export const getSellerCoupons = async (
  req,
  res,
  next
) => {
  try {
    const {
      data: coupons,
      error,
    } = await supabaseAdmin
      .from("coupons")
      .select("*")
      .eq("created_by", req.profile.id)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      return res.status(500).json({
        success: false,
        message:
          "Unable to fetch seller coupons",
      });
    }

    return res.status(200).json({
      success: true,
      coupons: coupons || [],
    });
  } catch (error) {
    next(error);
  }
};


/*
|--------------------------------------------------------------------------
| SELLER - CREATE COUPON
|--------------------------------------------------------------------------
*/
export const createCoupon = async (
  req,
  res,
  next
) => {
  try {
    const {
      code,
      discount_type,
      discount_value,
      minimum_order_amount = 0,
      maximum_discount = null,
      usage_limit = null,
      starts_at = null,
      expires_at = null,
      is_active = true,
    } = req.body;

    if (!code?.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Coupon code is required",
      });
    }

    if (
      !["percentage", "fixed"].includes(
        discount_type
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid discount type",
      });
    }

    const discountValue =
      Number(discount_value);

    if (
      !Number.isFinite(discountValue) ||
      discountValue <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Discount value must be greater than 0",
      });
    }

    if (
      discount_type ===
        "percentage" &&
      discountValue > 100
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Percentage discount cannot exceed 100",
      });
    }

    const minimumAmount =
      Number(minimum_order_amount);

    if (
      !Number.isFinite(minimumAmount) ||
      minimumAmount < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid minimum order amount",
      });
    }

    let maximumDiscount = null;

    if (
      maximum_discount !== null &&
      maximum_discount !==
        undefined &&
      maximum_discount !== ""
    ) {
      maximumDiscount =
        Number(maximum_discount);

      if (
        !Number.isFinite(
          maximumDiscount
        ) ||
        maximumDiscount < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid maximum discount",
        });
      }
    }

    let usageLimit = null;

    if (
      usage_limit !== null &&
      usage_limit !==
        undefined &&
      usage_limit !== ""
    ) {
      usageLimit =
        Number(usage_limit);

      if (
        !Number.isInteger(
          usageLimit
        ) ||
        usageLimit <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid usage limit",
        });
      }
    }

    const {
      data: coupon,
      error,
    } = await supabaseAdmin
      .from("coupons")
      .insert({
        code: code.trim().toUpperCase(),
        discount_type,
        discount_value:
          discountValue,
        minimum_order_amount:
          minimumAmount,
        maximum_discount:
          maximumDiscount,
        usage_limit:
          usageLimit,
        starts_at,
        expires_at,
        is_active:
          Boolean(is_active),
        created_by:
          req.profile.id,
      })
      .select("*")
      .single();

    if (error) {
      if (
        error.code === "23505"
      ) {
        return res.status(409).json({
          success: false,
          message:
            "Coupon code already exists",
        });
      }

      return res.status(400).json({
        success: false,
        message:
          error.message ||
          "Unable to create coupon",
      });
    }

    return res.status(201).json({
      success: true,
      message:
        "Coupon created successfully",
      coupon,
    });
  } catch (error) {
    next(error);
  }
};


/*
|--------------------------------------------------------------------------
| SELLER - UPDATE COUPON
|--------------------------------------------------------------------------
*/
export const updateCoupon = async (
  req,
  res,
  next
) => {
  try {
    const { id } =
      req.validated.params;

    const {
      code,
      discount_type,
      discount_value,
      minimum_order_amount,
      maximum_discount,
      usage_limit,
      starts_at,
      expires_at,
      is_active,
    } = req.body;

    const {
      data: existingCoupon,
      error: findError,
    } = await supabaseAdmin
      .from("coupons")
      .select("*")
      .eq("id", id)
      .eq(
        "created_by",
        req.profile.id
      )
      .single();

    if (
      findError ||
      !existingCoupon
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Coupon not found",
      });
    }

    const updates = {};

    if (code !== undefined) {
      if (!code.trim()) {
        return res.status(400).json({
          success: false,
          message:
            "Coupon code cannot be empty",
        });
      }

      updates.code =
        code.trim().toUpperCase();
    }

    if (
      discount_type !==
      undefined
    ) {
      if (
        ![
          "percentage",
          "fixed",
        ].includes(discount_type)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid discount type",
        });
      }

      updates.discount_type =
        discount_type;
    }

    if (
      discount_value !==
      undefined
    ) {
      const value =
        Number(discount_value);

      if (
        !Number.isFinite(value) ||
        value <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid discount value",
        });
      }

      const finalType =
        updates.discount_type ||
        existingCoupon.discount_type;

      if (
        finalType ===
          "percentage" &&
        value > 100
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Percentage discount cannot exceed 100",
        });
      }

      updates.discount_value =
        value;
    }

    if (
      minimum_order_amount !==
      undefined
    ) {
      const value =
        Number(
          minimum_order_amount
        );

      if (
        !Number.isFinite(value) ||
        value < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid minimum order amount",
        });
      }

      updates.minimum_order_amount =
        value;
    }

    if (
      maximum_discount !==
      undefined
    ) {
      if (
        maximum_discount ===
          null ||
        maximum_discount === ""
      ) {
        updates.maximum_discount =
          null;
      } else {
        const value =
          Number(
            maximum_discount
          );

        if (
          !Number.isFinite(value) ||
          value < 0
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid maximum discount",
          });
        }

        updates.maximum_discount =
          value;
      }
    }

    if (
      usage_limit !==
      undefined
    ) {
      if (
        usage_limit ===
          null ||
        usage_limit === ""
      ) {
        updates.usage_limit =
          null;
      } else {
        const value =
          Number(usage_limit);

        if (
          !Number.isInteger(value) ||
          value <= 0
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid usage limit",
          });
        }

        if (
          value <
          existingCoupon.used_count
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Usage limit cannot be lower than current usage",
          });
        }

        updates.usage_limit =
          value;
      }
    }

    if (
      starts_at !== undefined
    ) {
      updates.starts_at =
        starts_at;
    }

    if (
      expires_at !== undefined
    ) {
      updates.expires_at =
        expires_at;
    }

    if (
      is_active !== undefined
    ) {
      updates.is_active =
        Boolean(is_active);
    }

    updates.updated_at =
      new Date().toISOString();

    const {
      data: coupon,
      error,
    } = await supabaseAdmin
      .from("coupons")
      .update(updates)
      .eq("id", id)
      .eq(
        "created_by",
        req.profile.id
      )
      .select("*")
      .single();

    if (error) {
      if (
        error.code === "23505"
      ) {
        return res.status(409).json({
          success: false,
          message:
            "Coupon code already exists",
        });
      }

      return res.status(400).json({
        success: false,
        message:
          error.message ||
          "Unable to update coupon",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Coupon updated successfully",
      coupon,
    });
  } catch (error) {
    next(error);
  }
};


/*
|--------------------------------------------------------------------------
| SELLER - DELETE / DEACTIVATE COUPON
|--------------------------------------------------------------------------
*/
export const deleteCoupon = async (
  req,
  res,
  next
) => {
  try {
    const { id } =
      req.validated.params;

    const {
      data: coupon,
      error,
    } = await supabaseAdmin
      .from("coupons")
      .update({
        is_active: false,
        updated_at:
          new Date().toISOString(),
      })
      .eq("id", id)
      .eq(
        "created_by",
        req.profile.id
      )
      .select("*")
      .single();

    if (error || !coupon) {
      return res.status(404).json({
        success: false,
        message:
          "Coupon not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Coupon deactivated successfully",
      coupon,
    });
  } catch (error) {
    next(error);
  }
};