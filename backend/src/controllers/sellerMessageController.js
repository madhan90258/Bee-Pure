import { supabaseAdmin } from "../config/supabase.js";

/**
 * GET /api/seller/messages
 * Get all contact messages for seller
 */
export const getSellerMessages = async (req, res, next) => {
  try {
    const { data: messages, error } = await supabaseAdmin
      .from("contact_messages")
      .select(
        `
        id,
        name,
        email,
        phone,
        subject,
        message,
        status,
        created_at
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Get seller messages error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to load messages",
      });
    }

    return res.status(200).json({
      success: true,
      messages: messages || [],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/seller/messages/:id/status
 * Update message status
 */
export const updateSellerMessageStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "new",
      "read",
      "replied",
      "closed",
    ];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid message status",
      });
    }

    const { data: message, error } = await supabaseAdmin
      .from("contact_messages")
      .update({
        status,
      })
      .eq("id", id)
      .select(
        `
        id,
        name,
        email,
        phone,
        subject,
        message,
        status,
        created_at
      `
      )
      .single();

    if (error) {
      console.error("Update seller message status error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to update message status",
      });
    }

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    return res.status(200).json({
      success: true,
      message,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/seller/messages/:id
 * Delete a message
 */
export const deleteSellerMessage = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: existingMessage, error: findError } =
      await supabaseAdmin
        .from("contact_messages")
        .select("id")
        .eq("id", id)
        .single();

    if (findError || !existingMessage) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    const { error: deleteError } = await supabaseAdmin
      .from("contact_messages")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Delete seller message error:", deleteError);

      return res.status(500).json({
        success: false,
        message: "Failed to delete message",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};