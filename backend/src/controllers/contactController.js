import { supabaseAdmin } from "../config/supabase.js";


/*
|--------------------------------------------------------------------------
| CREATE CONTACT MESSAGE
|--------------------------------------------------------------------------
*/
export const createContactMessage =
  async (req, res, next) => {
    try {
      const {
        name,
        email,
        phone = null,
        subject = null,
        message,
      } = req.body;

      if (
        !name?.trim() ||
        !email?.trim() ||
        !message?.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Name, email and message are required",
        });
      }

      const {
        data,
        error,
      } = await supabaseAdmin
        .from("contact_messages")
        .insert({
          name: name.trim(),
          email:
            email.trim().toLowerCase(),
          phone:
            phone?.trim() || null,
          subject:
            subject?.trim() || null,
          message:
            message.trim(),
          status: "new",
        })
        .select(`
          id,
          name,
          email,
          phone,
          subject,
          message,
          status,
          created_at
        `)
        .single();

      if (error) {
        return res.status(400).json({
          success: false,
          message:
            "Unable to submit contact message",
        });
      }

      return res.status(201).json({
        success: true,
        message:
          "Your message has been submitted successfully",
        contact: data,
      });
    } catch (error) {
      next(error);
    }
  };


/*
|--------------------------------------------------------------------------
| ADMIN - GET CONTACT MESSAGES
|--------------------------------------------------------------------------
*/
export const getContactMessages =
  async (req, res, next) => {
    try {
      const {
        data: messages,
        error,
      } = await supabaseAdmin
        .from("contact_messages")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        return res.status(500).json({
          success: false,
          message:
            "Unable to fetch contact messages",
        });
      }

      return res.status(200).json({
        success: true,
        messages:
          messages || [],
      });
    } catch (error) {
      next(error);
    }
  };


/*
|--------------------------------------------------------------------------
| ADMIN - UPDATE CONTACT STATUS
|--------------------------------------------------------------------------
*/
export const updateContactStatus =
  async (req, res, next) => {
    try {
      const { id } =
        req.validated.params;

      const {
        status,
      } = req.body;

      const allowedStatuses = [
        "new",
        "read",
        "replied",
        "closed",
      ];

      if (
        !allowedStatuses.includes(
          status
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid contact status",
        });
      }

      const {
        data: message,
        error,
      } = await supabaseAdmin
        .from("contact_messages")
        .update({
          status,
        })
        .eq("id", id)
        .select("*")
        .single();

      if (error || !message) {
        return res.status(404).json({
          success: false,
          message:
            "Contact message not found",
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Contact status updated successfully",
        contact:
          message,
      });
    } catch (error) {
      next(error);
    }
  };