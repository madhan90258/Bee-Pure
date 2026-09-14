import { supabaseAdmin } from "../config/supabase.js";


/*
|--------------------------------------------------------------------------
| SUBSCRIBE
|--------------------------------------------------------------------------
*/
export const subscribeNewsletter =
  async (req, res, next) => {
    try {
      const {
        email,
      } = req.body;

      if (
        !email?.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Email is required",
        });
      }

      const normalizedEmail =
        email
          .trim()
          .toLowerCase();

      const {
        data: existing,
        error: findError,
      } = await supabaseAdmin
        .from(
          "newsletter_subscribers"
        )
        .select(
          "id, email, is_active"
        )
        .eq(
          "email",
          normalizedEmail
        )
        .maybeSingle();

      if (findError) {
        return res.status(500).json({
          success: false,
          message:
            "Unable to process subscription",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | Existing active subscriber
      |--------------------------------------------------------------------------
      */

      if (
        existing?.is_active
      ) {
        return res.status(200).json({
          success: true,
          message:
            "You are already subscribed",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | Reactivate existing subscriber
      |--------------------------------------------------------------------------
      */

      if (existing) {
        const {
          error,
        } = await supabaseAdmin
          .from(
            "newsletter_subscribers"
          )
          .update({
            is_active: true,
            subscribed_at:
              new Date().toISOString(),
          })
          .eq(
            "id",
            existing.id
          );

        if (error) {
          return res.status(400).json({
            success: false,
            message:
              "Unable to reactivate subscription",
          });
        }

        return res.status(200).json({
          success: true,
          message:
            "Newsletter subscription reactivated",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | New subscriber
      |--------------------------------------------------------------------------
      */

      const {
        error,
      } = await supabaseAdmin
        .from(
          "newsletter_subscribers"
        )
        .insert({
          email:
            normalizedEmail,
          is_active: true,
          subscribed_at:
            new Date().toISOString(),
        });

      if (error) {
        if (
          error.code ===
          "23505"
        ) {
          return res.status(409).json({
            success: false,
            message:
              "Email is already subscribed",
          });
        }

        return res.status(400).json({
          success: false,
          message:
            "Unable to subscribe",
        });
      }

      return res.status(201).json({
        success: true,
        message:
          "Successfully subscribed to the newsletter",
      });
    } catch (error) {
      next(error);
    }
  };


/*
|--------------------------------------------------------------------------
| UNSUBSCRIBE
|--------------------------------------------------------------------------
*/
export const unsubscribeNewsletter =
  async (req, res, next) => {
    try {
      const {
        email,
      } = req.body;

      if (
        !email?.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Email is required",
        });
      }

      const normalizedEmail =
        email
          .trim()
          .toLowerCase();

      const {
        data,
        error,
      } = await supabaseAdmin
        .from(
          "newsletter_subscribers"
        )
        .update({
          is_active: false,
        })
        .eq(
          "email",
          normalizedEmail
        )
        .select(
          "id, email, is_active"
        )
        .maybeSingle();

      if (error) {
        return res.status(400).json({
          success: false,
          message:
            "Unable to unsubscribe",
        });
      }

      if (!data) {
        return res.status(404).json({
          success: false,
          message:
            "Email subscription not found",
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Successfully unsubscribed",
      });
    } catch (error) {
      next(error);
    }
  };


/*
|--------------------------------------------------------------------------
| ADMIN - GET SUBSCRIBERS
|--------------------------------------------------------------------------
*/
export const getNewsletterSubscribers =
  async (req, res, next) => {
    try {
      const {
        data: subscribers,
        error,
      } = await supabaseAdmin
        .from(
          "newsletter_subscribers"
        )
        .select("*")
        .order(
          "subscribed_at",
          {
            ascending: false,
          }
        );

      if (error) {
        return res.status(500).json({
          success: false,
          message:
            "Unable to fetch subscribers",
        });
      }

      return res.status(200).json({
        success: true,
        subscribers:
          subscribers || [],
      });
    } catch (error) {
      next(error);
    }
  };