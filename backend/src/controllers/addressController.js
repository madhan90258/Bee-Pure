import { supabaseAdmin } from "../config/supabase.js";

/* =========================================
   GET ALL ADDRESSES
========================================= */

export const getAddresses = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabaseAdmin
      .from("addresses")
      .select(`
        id,
        user_id,
        full_name,
        phone,
        address_line_1,
        address_line_2,
        city,
        state,
        pincode,
        latitude,
        longitude,
        is_default,
        created_at,
        updated_at
      `)
      .eq("user_id", userId)
      .order("is_default", {
        ascending: false,
      })
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "Get addresses error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Unable to fetch addresses",
      });
    }

    return res.status(200).json({
      success: true,
      addresses: data || [],
    });
  } catch (error) {
    next(error);
  }
};


/* =========================================
   ADD ADDRESS
========================================= */

export const createAddress = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.user.id;

    const {
      full_name,
      phone,
      address_line_1,
      address_line_2,
      city,
      state,
      pincode,
      latitude,
      longitude,
      is_default,
    } = req.body;

    /* -------------------------------------
       BASIC VALIDATION
    ------------------------------------- */

    if (
      !full_name ||
      !phone ||
      !address_line_1 ||
      !city ||
      !state ||
      !pincode
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Full name, phone, address, city, state and pincode are required",
      });
    }

    /* -------------------------------------
       CHECK EXISTING ADDRESSES
    ------------------------------------- */

    const {
      count,
      error: countError,
    } = await supabaseAdmin
      .from("addresses")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("user_id", userId);

    if (countError) {
      console.error(
        "Check addresses error:",
        countError
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to check existing addresses",
      });
    }

    /*
      First address automatically becomes
      the default address.
    */

    const shouldBeDefault =
      count === 0 || is_default === true;

    /* -------------------------------------
       IF NEW ADDRESS IS DEFAULT
       REMOVE OLD DEFAULT
    ------------------------------------- */

    if (shouldBeDefault) {
      const { error: defaultError } =
        await supabaseAdmin
          .from("addresses")
          .update({
            is_default: false,
          })
          .eq("user_id", userId);

      if (defaultError) {
        console.error(
          "Reset default address error:",
          defaultError
        );

        return res.status(500).json({
          success: false,
          message:
            "Unable to update default address",
        });
      }
    }

    /* -------------------------------------
       CREATE ADDRESS
    ------------------------------------- */

    const { data, error } =
      await supabaseAdmin
        .from("addresses")
        .insert({
          user_id: userId,
          full_name: full_name.trim(),
          phone: phone.trim(),
          address_line_1:
            address_line_1.trim(),
          address_line_2:
            address_line_2
              ? address_line_2.trim()
              : null,
          city: city.trim(),
          state: state.trim(),
          pincode: pincode.trim(),
          latitude:
            latitude !== undefined
              ? latitude
              : null,
          longitude:
            longitude !== undefined
              ? longitude
              : null,
          is_default: shouldBeDefault,
        })
        .select(`
          id,
          user_id,
          full_name,
          phone,
          address_line_1,
          address_line_2,
          city,
          state,
          pincode,
          latitude,
          longitude,
          is_default,
          created_at,
          updated_at
        `)
        .single();

    if (error) {
      console.error(
        "Create address error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to create address",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Address added successfully",
      address: data,
    });
  } catch (error) {
    next(error);
  }
};


/* =========================================
   UPDATE ADDRESS
========================================= */

export const updateAddress = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const {
      full_name,
      phone,
      address_line_1,
      address_line_2,
      city,
      state,
      pincode,
      latitude,
      longitude,
      is_default,
    } = req.body;

    /* -------------------------------------
       CHECK ADDRESS BELONGS TO USER
    ------------------------------------- */

    const {
      data: existingAddress,
      error: existingError,
    } = await supabaseAdmin
      .from("addresses")
      .select("id, user_id")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (
      existingError ||
      !existingAddress
    ) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    /* -------------------------------------
       BUILD UPDATE DATA
    ------------------------------------- */

    const updateData = {};

    if (full_name !== undefined) {
      updateData.full_name =
        full_name.trim();
    }

    if (phone !== undefined) {
      updateData.phone =
        phone.trim();
    }

    if (
      address_line_1 !== undefined
    ) {
      updateData.address_line_1 =
        address_line_1.trim();
    }

    if (
      address_line_2 !== undefined
    ) {
      updateData.address_line_2 =
        address_line_2
          ? address_line_2.trim()
          : null;
    }

    if (city !== undefined) {
      updateData.city =
        city.trim();
    }

    if (state !== undefined) {
      updateData.state =
        state.trim();
    }

    if (pincode !== undefined) {
      updateData.pincode =
        pincode.trim();
    }

    if (latitude !== undefined) {
      updateData.latitude =
        latitude;
    }

    if (longitude !== undefined) {
      updateData.longitude =
        longitude;
    }

    /* -------------------------------------
       DEFAULT ADDRESS
    ------------------------------------- */

    if (is_default === true) {
      const { error: defaultError } =
        await supabaseAdmin
          .from("addresses")
          .update({
            is_default: false,
          })
          .eq("user_id", userId);

      if (defaultError) {
        console.error(
          "Reset default address error:",
          defaultError
        );

        return res.status(500).json({
          success: false,
          message:
            "Unable to update default address",
        });
      }

      updateData.is_default = true;
    }

    if (is_default === false) {
      updateData.is_default = false;
    }

    /* -------------------------------------
       UPDATE
    ------------------------------------- */

    const { data, error } =
      await supabaseAdmin
        .from("addresses")
        .update(updateData)
        .eq("id", id)
        .eq("user_id", userId)
        .select(`
          id,
          user_id,
          full_name,
          phone,
          address_line_1,
          address_line_2,
          city,
          state,
          pincode,
          latitude,
          longitude,
          is_default,
          created_at,
          updated_at
        `)
        .single();

    if (error) {
      console.error(
        "Update address error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to update address",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Address updated successfully",
      address: data,
    });
  } catch (error) {
    next(error);
  }
};


/* =========================================
   DELETE ADDRESS
========================================= */

export const deleteAddress = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    /* -------------------------------------
       GET ADDRESS FIRST
    ------------------------------------- */

    const {
      data: address,
      error: addressError,
    } = await supabaseAdmin
      .from("addresses")
      .select(
        "id, user_id, is_default"
      )
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (
      addressError ||
      !address
    ) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    /* -------------------------------------
       DELETE
    ------------------------------------- */

    const { error } =
      await supabaseAdmin
        .from("addresses")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);

    if (error) {
      console.error(
        "Delete address error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to delete address",
      });
    }

    /* -------------------------------------
       IF DEFAULT WAS DELETED
       SET ANOTHER ADDRESS AS DEFAULT
    ------------------------------------- */

    if (address.is_default) {
      const {
        data: nextAddress,
        error: nextError,
      } = await supabaseAdmin
        .from("addresses")
        .select("id")
        .eq("user_id", userId)
        .order("created_at", {
          ascending: false,
        })
        .limit(1)
        .maybeSingle();

      if (
        !nextError &&
        nextAddress
      ) {
        await supabaseAdmin
          .from("addresses")
          .update({
            is_default: true,
          })
          .eq(
            "id",
            nextAddress.id
          )
          .eq(
            "user_id",
            userId
          );
      }
    }

    return res.status(200).json({
      success: true,
      message:
        "Address deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};


/* =========================================
   SET DEFAULT ADDRESS
========================================= */

export const setDefaultAddress = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    /* -------------------------------------
       CHECK ADDRESS
    ------------------------------------- */

    const {
      data: address,
      error: addressError,
    } = await supabaseAdmin
      .from("addresses")
      .select("id")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (
      addressError ||
      !address
    ) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    /* -------------------------------------
       REMOVE CURRENT DEFAULT
    ------------------------------------- */

    const { error: resetError } =
      await supabaseAdmin
        .from("addresses")
        .update({
          is_default: false,
        })
        .eq("user_id", userId);

    if (resetError) {
      console.error(
        "Reset default address error:",
        resetError
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to update default address",
      });
    }

    /* -------------------------------------
       SET NEW DEFAULT
    ------------------------------------- */

    const {
      data,
      error,
    } = await supabaseAdmin
      .from("addresses")
      .update({
        is_default: true,
      })
      .eq("id", id)
      .eq("user_id", userId)
      .select(`
        id,
        user_id,
        full_name,
        phone,
        address_line_1,
        address_line_2,
        city,
        state,
        pincode,
        latitude,
        longitude,
        is_default,
        created_at,
        updated_at
      `)
      .single();

    if (error) {
      console.error(
        "Set default address error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to set default address",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Default address updated successfully",
      address: data,
    });
  } catch (error) {
    next(error);
  }
};