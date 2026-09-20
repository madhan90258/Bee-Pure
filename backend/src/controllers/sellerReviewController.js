import { supabaseAdmin } from "../config/supabase.js";

/*
|--------------------------------------------------------------------------
| GET SELLER REVIEWS
|--------------------------------------------------------------------------
|
| Only reviews belonging to products owned by the logged-in seller
| are returned.
|
*/

export const getSellerReviews = async (
  req,
  res,
  next
) => {
  try {
    const sellerId = req.profile.id;

    /*
    |--------------------------------------------------------------------------
    | Get seller products
    |--------------------------------------------------------------------------
    */

    const {
      data: sellerProducts,
      error: productsError,
    } = await supabaseAdmin
      .from("products")
      .select("id, name")
      .eq("seller_id", sellerId);

    if (productsError) {
      console.error(
        "Get seller products for reviews error:",
        productsError
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load seller products",
      });
    }

    if (
      !sellerProducts ||
      sellerProducts.length === 0
    ) {
      return res.status(200).json({
        success: true,
        reviews: [],
        stats: {
          total_reviews: 0,
          visible_reviews: 0,
          average_rating: 0,
        },
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Product map
    |--------------------------------------------------------------------------
    */

    const productMap = new Map(
      sellerProducts.map((product) => [
        product.id,
        product.name,
      ])
    );

    const productIds =
      sellerProducts.map(
        (product) => product.id
      );

    /*
    |--------------------------------------------------------------------------
    | Get reviews
    |--------------------------------------------------------------------------
    */

    const {
      data: reviews,
      error: reviewsError,
    } = await supabaseAdmin
      .from("reviews")
      .select(
        `
        id,
        product_id,
        user_id,
        order_id,
        rating,
        review_text,
        is_approved,
        created_at,
        updated_at
        `
      )
      .in(
        "product_id",
        productIds
      )
      .order(
        "created_at",
        {
          ascending: false,
        }
      );

    if (reviewsError) {
      console.error(
        "Get seller reviews error:",
        reviewsError
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load reviews",
      });
    }

    const reviewRows =
      reviews || [];

    /*
    |--------------------------------------------------------------------------
    | Get customer profiles
    |--------------------------------------------------------------------------
    */

    const userIds = [
      ...new Set(
        reviewRows
          .map(
            (review) =>
              review.user_id
          )
          .filter(Boolean)
      ),
    ];

    let profiles = [];

    if (userIds.length > 0) {
      const {
        data: profileData,
        error: profilesError,
      } = await supabaseAdmin
        .from("profiles")
        .select(
          "id, full_name, email"
        )
        .in(
          "id",
          userIds
        );

      if (profilesError) {
        console.error(
          "Get review customer profiles error:",
          profilesError
        );

        return res.status(500).json({
          success: false,
          message:
            "Unable to load review customers",
        });
      }

      profiles =
        profileData || [];
    }

    /*
    |--------------------------------------------------------------------------
    | Profile map
    |--------------------------------------------------------------------------
    */

    const profileMap = new Map(
      profiles.map((profile) => [
        profile.id,
        profile,
      ])
    );

    /*
    |--------------------------------------------------------------------------
    | Format reviews
    |--------------------------------------------------------------------------
    */

    const formattedReviews =
      reviewRows.map(
        (review) => {
          const customer =
            profileMap.get(
              review.user_id
            );

          return {
            id: review.id,

            product_id:
              review.product_id,

            product:
              productMap.get(
                review.product_id
              ) ||
              "Unknown Product",

            customer:
              customer?.full_name ||
              "Customer",

            email:
              customer?.email ||
              "",

            rating:
              review.rating,

            review:
              review.review_text ||
              "",

            date:
              review.created_at,

            visible:
              review.is_approved,

            is_approved:
              review.is_approved,

            order_id:
              review.order_id,

            created_at:
              review.created_at,

            updated_at:
              review.updated_at,
          };
        }
      );

    /*
    |--------------------------------------------------------------------------
    | Statistics
    |--------------------------------------------------------------------------
    */

    const totalReviews =
      formattedReviews.length;

    const visibleReviews =
      formattedReviews.filter(
        (review) =>
          review.visible
      ).length;

    const averageRating =
      totalReviews > 0
        ? (
            formattedReviews.reduce(
              (
                total,
                review
              ) =>
                total +
                Number(
                  review.rating
                ),
              0
            ) /
            totalReviews
          ).toFixed(1)
        : "0.0";

    /*
    |--------------------------------------------------------------------------
    | Response
    |--------------------------------------------------------------------------
    */

    return res.status(200).json({
      success: true,

      reviews:
        formattedReviews,

      stats: {
        total_reviews:
          totalReviews,

        visible_reviews:
          visibleReviews,

        average_rating:
          Number(
            averageRating
          ),
      },
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE REVIEW VISIBILITY
|--------------------------------------------------------------------------
|
| Visible  -> is_approved = true
| Hidden   -> is_approved = false
|
*/

export const updateSellerReviewVisibility =
  async (
    req,
    res,
    next
  ) => {
    try {
      const {
        id,
      } = req.params;

      const {
        is_approved,
      } = req.body;

      if (
        typeof is_approved !==
        "boolean"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "is_approved must be a boolean",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | Verify review belongs to seller
      |--------------------------------------------------------------------------
      */

      const {
        data: review,
        error: reviewError,
      } = await supabaseAdmin
        .from("reviews")
        .select(
          `
          id,
          product_id
          `
        )
        .eq(
          "id",
          id
        )
        .single();

      if (
        reviewError ||
        !review
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Review not found",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | Verify product belongs to seller
      |--------------------------------------------------------------------------
      */

      const {
        data: product,
        error: productError,
      } = await supabaseAdmin
        .from("products")
        .select(
          "id, seller_id"
        )
        .eq(
          "id",
          review.product_id
        )
        .eq(
          "seller_id",
          req.profile.id
        )
        .single();

      if (
        productError ||
        !product
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You do not have permission to update this review",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | Update approval
      |--------------------------------------------------------------------------
      */

      const {
        data: updatedReview,
        error: updateError,
      } = await supabaseAdmin
        .from("reviews")
        .update({
          is_approved,
          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          id
        )
        .select(
          `
          id,
          product_id,
          user_id,
          order_id,
          rating,
          review_text,
          is_approved,
          created_at,
          updated_at
          `
        )
        .single();

      if (
        updateError ||
        !updatedReview
      ) {
        console.error(
          "Update review visibility error:",
          updateError
        );

        return res.status(500).json({
          success: false,
          message:
            "Unable to update review visibility",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | Get product
      |--------------------------------------------------------------------------
      */

      const {
        data: updatedProduct,
      } = await supabaseAdmin
        .from("products")
        .select(
          "id, name"
        )
        .eq(
          "id",
          updatedReview.product_id
        )
        .single();

      /*
      |--------------------------------------------------------------------------
      | Get customer
      |--------------------------------------------------------------------------
      */

      const {
        data: customer,
      } = await supabaseAdmin
        .from("profiles")
        .select(
          "id, full_name, email"
        )
        .eq(
          "id",
          updatedReview.user_id
        )
        .single();

      /*
      |--------------------------------------------------------------------------
      | Response
      |--------------------------------------------------------------------------
      */

      return res.status(200).json({
        success: true,

        message:
          is_approved
            ? "Review is now visible"
            : "Review has been hidden",

        review: {
          id:
            updatedReview.id,

          product_id:
            updatedReview.product_id,

          product:
            updatedProduct?.name ||
            "Unknown Product",

          customer:
            customer?.full_name ||
            "Customer",

          email:
            customer?.email ||
            "",

          rating:
            updatedReview.rating,

          review:
            updatedReview.review_text ||
            "",

          date:
            updatedReview.created_at,

          visible:
            updatedReview.is_approved,

          is_approved:
            updatedReview.is_approved,

          order_id:
            updatedReview.order_id,

          created_at:
            updatedReview.created_at,

          updated_at:
            updatedReview.updated_at,
        },
      });
    } catch (error) {
      next(error);
    }
  };

/*
|--------------------------------------------------------------------------
| DELETE SELLER REVIEW
|--------------------------------------------------------------------------
*/

export const deleteSellerReview =
  async (
    req,
    res,
    next
  ) => {
    try {
      const {
        id,
      } = req.params;

      /*
      |--------------------------------------------------------------------------
      | Find review
      |--------------------------------------------------------------------------
      */

      const {
        data: review,
        error: reviewError,
      } = await supabaseAdmin
        .from("reviews")
        .select(
          `
          id,
          product_id
          `
        )
        .eq(
          "id",
          id
        )
        .single();

      if (
        reviewError ||
        !review
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Review not found",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | Verify seller owns product
      |--------------------------------------------------------------------------
      */

      const {
        data: product,
        error: productError,
      } = await supabaseAdmin
        .from("products")
        .select(
          "id, seller_id"
        )
        .eq(
          "id",
          review.product_id
        )
        .eq(
          "seller_id",
          req.profile.id
        )
        .single();

      if (
        productError ||
        !product
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You do not have permission to delete this review",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | Delete review
      |--------------------------------------------------------------------------
      */

      const {
        error: deleteError,
      } = await supabaseAdmin
        .from("reviews")
        .delete()
        .eq(
          "id",
          id
        );

      if (deleteError) {
        console.error(
          "Delete seller review error:",
          deleteError
        );

        return res.status(500).json({
          success: false,
          message:
            "Unable to delete review",
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Review deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  };