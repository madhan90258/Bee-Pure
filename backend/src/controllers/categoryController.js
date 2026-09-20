import { supabaseAdmin } from "../config/supabase.js";

/*
|--------------------------------------------------------------------------
| Get All Categories
|--------------------------------------------------------------------------
*/

export const getCategories = async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("categories")
      .select(`
        id,
        name,
        slug,
        description,
        image_path,
        is_active,
        created_at,
        updated_at
      `)
      .eq("is_active", true)
      .order("name", {
        ascending: true,
      });

    if (error) {
      console.error("Get categories error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to fetch categories",
      });
    }

    return res.status(200).json({
      success: true,
      categories: data || [],
    });
  } catch (error) {
    next(error);
  }
};


/*
|--------------------------------------------------------------------------
| Get Category By ID
|--------------------------------------------------------------------------
*/

export const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from("categories")
      .select(`
        id,
        name,
        slug,
        description,
        image_path,
        is_active,
        created_at,
        updated_at
      `)
      .eq("id", id)
      .eq("is_active", true)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      category: data,
    });
  } catch (error) {
    next(error);
  }
};


/*
|--------------------------------------------------------------------------
| Get Category By Slug
|--------------------------------------------------------------------------
*/

export const getCategoryBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const { data, error } = await supabaseAdmin
      .from("categories")
      .select(`
        id,
        name,
        slug,
        description,
        image_path,
        is_active,
        created_at,
        updated_at
      `)
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      category: data,
    });
  } catch (error) {
    next(error);
  }
};


/*
|--------------------------------------------------------------------------
| Seller: Get All Categories
|--------------------------------------------------------------------------
|
| Unlike the public endpoint, this returns both active and inactive
| categories so the seller can manage them.
|
*/

export const getSellerCategories = async (
  req,
  res,
  next
) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("categories")
      .select(`
        id,
        name,
        slug,
        description,
        image_path,
        is_active,
        created_at,
        updated_at
      `)
      .order("name", {
        ascending: true,
      });

    if (error) {
      console.error(
        "Get seller categories error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Unable to fetch categories",
      });
    }

    return res.status(200).json({
      success: true,
      categories: data || [],
    });
  } catch (error) {
    next(error);
  }
};


/*
|--------------------------------------------------------------------------
| Seller: Create Category
|--------------------------------------------------------------------------
*/

export const createCategory = async (
  req,
  res,
  next
) => {
  try {
    const {
      name,
      description = "",
      image_path = null,
      is_active = true,
    } = req.body;

    const trimmedName =
      typeof name === "string"
        ? name.trim()
        : "";

    if (!trimmedName) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    /*
    |----------------------------------------------------------------------
    | Generate slug
    |----------------------------------------------------------------------
    */

    const slug = trimmedName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    if (!slug) {
      return res.status(400).json({
        success: false,
        message: "Unable to generate category slug",
      });
    }

    /*
    |----------------------------------------------------------------------
    | Check duplicate name
    |----------------------------------------------------------------------
    */

    const {
      data: existingCategory,
      error: existingError,
    } = await supabaseAdmin
      .from("categories")
      .select("id")
      .eq("name", trimmedName)
      .maybeSingle();

    if (existingError) {
      console.error(
        "Check category error:",
        existingError
      );

      return res.status(500).json({
        success: false,
        message: "Unable to check category",
      });
    }

    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message: "A category with this name already exists",
      });
    }

    /*
    |----------------------------------------------------------------------
    | Check duplicate slug
    |----------------------------------------------------------------------
    */

    const {
      data: existingSlug,
      error: slugError,
    } = await supabaseAdmin
      .from("categories")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (slugError) {
      console.error(
        "Check category slug error:",
        slugError
      );

      return res.status(500).json({
        success: false,
        message: "Unable to check category slug",
      });
    }

    if (existingSlug) {
      return res.status(409).json({
        success: false,
        message:
          "A category with this slug already exists",
      });
    }

    /*
    |----------------------------------------------------------------------
    | Insert category
    |----------------------------------------------------------------------
    */

    const {
      data,
      error,
    } = await supabaseAdmin
      .from("categories")
      .insert({
        name: trimmedName,
        slug,
        description:
          typeof description === "string"
            ? description.trim()
            : "",
        image_path:
          image_path || null,
        is_active:
          Boolean(is_active),
      })
      .select(`
        id,
        name,
        slug,
        description,
        image_path,
        is_active,
        created_at,
        updated_at
      `)
      .single();

    if (error) {
      console.error(
        "Create category error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Unable to create category",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      category: data,
    });
  } catch (error) {
    next(error);
  }
};


/*
|--------------------------------------------------------------------------
| Seller: Update Category
|--------------------------------------------------------------------------
*/

export const updateCategory = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    const {
      name,
      description,
      image_path,
      is_active,
    } = req.body;

    /*
    |----------------------------------------------------------------------
    | Check category exists
    |----------------------------------------------------------------------
    */

    const {
      data: existingCategory,
      error: existingError,
    } = await supabaseAdmin
      .from("categories")
      .select(`
        id,
        name,
        slug,
        description,
        image_path,
        is_active
      `)
      .eq("id", id)
      .maybeSingle();

    if (existingError) {
      console.error(
        "Find category error:",
        existingError
      );

      return res.status(500).json({
        success: false,
        message: "Unable to find category",
      });
    }

    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    /*
    |----------------------------------------------------------------------
    | Build update object
    |----------------------------------------------------------------------
    */

    const updates = {};

    if (name !== undefined) {
      const trimmedName =
        typeof name === "string"
          ? name.trim()
          : "";

      if (!trimmedName) {
        return res.status(400).json({
          success: false,
          message: "Category name cannot be empty",
        });
      }

      updates.name = trimmedName;

      /*
      |--------------------------------------------------------------------
      | Regenerate slug when name changes
      |--------------------------------------------------------------------
      */

      const newSlug = trimmedName
        .toLowerCase()
        .trim()
        .replace(
          /[^a-z0-9\s-]/g,
          ""
        )
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

      if (!newSlug) {
        return res.status(400).json({
          success: false,
          message:
            "Unable to generate category slug",
        });
      }

      updates.slug = newSlug;
    }

    if (description !== undefined) {
      updates.description =
        typeof description === "string"
          ? description.trim()
          : "";
    }

    if (image_path !== undefined) {
      updates.image_path =
        image_path || null;
    }

    if (is_active !== undefined) {
      updates.is_active =
        Boolean(is_active);
    }

    /*
    |----------------------------------------------------------------------
    | Nothing to update
    |----------------------------------------------------------------------
    */

    if (
      Object.keys(updates).length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "No category changes provided",
      });
    }

    /*
    |----------------------------------------------------------------------
    | Duplicate name / slug check
    |----------------------------------------------------------------------
    */

    if (updates.name) {
      const {
        data: duplicateName,
        error: duplicateNameError,
      } = await supabaseAdmin
        .from("categories")
        .select("id")
        .eq("name", updates.name)
        .neq("id", id)
        .maybeSingle();

      if (duplicateNameError) {
        console.error(
          "Duplicate category name check error:",
          duplicateNameError
        );

        return res.status(500).json({
          success: false,
          message:
            "Unable to validate category name",
        });
      }

      if (duplicateName) {
        return res.status(409).json({
          success: false,
          message:
            "A category with this name already exists",
        });
      }
    }

    if (updates.slug) {
      const {
        data: duplicateSlug,
        error: duplicateSlugError,
      } = await supabaseAdmin
        .from("categories")
        .select("id")
        .eq("slug", updates.slug)
        .neq("id", id)
        .maybeSingle();

      if (duplicateSlugError) {
        console.error(
          "Duplicate category slug check error:",
          duplicateSlugError
        );

        return res.status(500).json({
          success: false,
          message:
            "Unable to validate category slug",
        });
      }

      if (duplicateSlug) {
        return res.status(409).json({
          success: false,
          message:
            "A category with this slug already exists",
        });
      }
    }

    /*
    |----------------------------------------------------------------------
    | Update category
    |----------------------------------------------------------------------
    */

    const {
      data,
      error,
    } = await supabaseAdmin
      .from("categories")
      .update(updates)
      .eq("id", id)
      .select(`
        id,
        name,
        slug,
        description,
        image_path,
        is_active,
        created_at,
        updated_at
      `)
      .single();

    if (error) {
      console.error(
        "Update category error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Unable to update category",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category: data,
    });
  } catch (error) {
    next(error);
  }
};


/*
|--------------------------------------------------------------------------
| Seller: Delete Category
|--------------------------------------------------------------------------
*/

export const deleteCategory = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    /*
    |----------------------------------------------------------------------
    | Check whether category exists
    |----------------------------------------------------------------------
    */

    const {
      data: category,
      error: categoryError,
    } = await supabaseAdmin
      .from("categories")
      .select("id, name")
      .eq("id", id)
      .maybeSingle();

    if (categoryError) {
      console.error(
        "Find category before delete error:",
        categoryError
      );

      return res.status(500).json({
        success: false,
        message: "Unable to find category",
      });
    }

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    /*
    |----------------------------------------------------------------------
    | Check whether products use this category
    |----------------------------------------------------------------------
    */

    const {
      count,
      error: productError,
    } = await supabaseAdmin
      .from("products")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("category_id", id);

    if (productError) {
      console.error(
        "Check category products error:",
        productError
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to check products for this category",
      });
    }

    if ((count || 0) > 0) {
      return res.status(409).json({
        success: false,
        message:
          "This category contains products. Move or remove those products before deleting the category.",
        productCount: count,
      });
    }

    /*
    |----------------------------------------------------------------------
    | Delete
    |----------------------------------------------------------------------
    */

    const {
      error: deleteError,
    } = await supabaseAdmin
      .from("categories")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error(
        "Delete category error:",
        deleteError
      );

      return res.status(500).json({
        success: false,
        message: "Unable to delete category",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};