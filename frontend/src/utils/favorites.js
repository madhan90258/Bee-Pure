import { supabase } from "../lib/supabase";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

const getAccessToken = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.access_token || null;
};


/* =========================================
   SUPABASE STORAGE IMAGE URL
========================================= */

const getProductImageUrl = (storagePath) => {
  if (!storagePath) {
    return "";
  }

  if (
    storagePath.startsWith("http://") ||
    storagePath.startsWith("https://")
  ) {
    return storagePath;
  }

  const { data } = supabase.storage
    .from("product-images")
    .getPublicUrl(storagePath);

  return data?.publicUrl || "";
};


/* =========================================
   GET FAVORITES
========================================= */

export const getFavorites = async () => {
  try {
    const token =
      await getAccessToken();

    if (!token) {
      return [];
    }

    const response = await fetch(
      `${API_URL}/api/favorites`,
      {
        method: "GET",

        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const result =
      await response.json();

    if (
      !response.ok ||
      !result.success
    ) {
      throw new Error(
        result.message ||
          "Unable to fetch favorites"
      );
    }

    return (result.favorites || [])
      .map((favorite) => {
        const product =
          favorite.products;

        if (!product) {
          return null;
        }

        const primaryImage =
          product.product_images?.find(
            (image) =>
              image.is_primary
          ) ||
          product.product_images?.[0];

        return {
          id: product.id,

          name: product.name,

          category:
            product.categories?.name ||
            "",

          price:
            Number(product.price) || 0,

          oldPrice:
            product.old_price != null
              ? Number(
                  product.old_price
                )
              : null,

          image:
            getProductImageUrl(
              primaryImage?.storage_path
            ),

          rating:
            Number(product.rating) || 0,

          description:
            product.description || "",

          stockQuantity:
            Number(
              product.stock_quantity
            ) || 0,

          slug:
            product.slug || "",

          farmer:
            product.farmers?.name ||
            "",
        };
      })
      .filter(Boolean);
  } catch (error) {
    console.error(
      "Get favorites error:",
      error
    );

    throw error;
  }
};


/* =========================================
   CHECK IF PRODUCT IS FAVORITE
========================================= */

export const isFavorite = async (
  productId
) => {
  try {
    const favorites =
      await getFavorites();

    return favorites.some(
      (product) =>
        String(product.id) ===
        String(productId)
    );
  } catch (error) {
    console.error(
      "Check favorite error:",
      error
    );

    return false;
  }
};


/* =========================================
   ADD TO FAVORITES
========================================= */

export const addToFavorites = async (
  product
) => {
  try {
    const token =
      await getAccessToken();

    if (!token) {
      throw new Error(
        "Please login to add favorites"
      );
    }

    if (!product?.id) {
      throw new Error(
        "Product ID is missing"
      );
    }

    const response = await fetch(
      `${API_URL}/api/favorites`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          product_id: product.id,
        }),
      }
    );

    const result =
      await response.json();

    if (
      !response.ok ||
      !result.success
    ) {
      throw new Error(
        result.message ||
          "Unable to add favorite"
      );
    }

    window.dispatchEvent(
      new Event("favoritesUpdated")
    );

    return true;
  } catch (error) {
    console.error(
      "Add favorite error:",
      error
    );

    throw error;
  }
};


/* =========================================
   REMOVE FROM FAVORITES
========================================= */

export const removeFromFavorites = async (
  productId
) => {
  try {
    const token =
      await getAccessToken();

    if (!token) {
      throw new Error(
        "Please login to manage favorites"
      );
    }

    const response = await fetch(
      `${API_URL}/api/favorites/${encodeURIComponent(
        productId
      )}`,
      {
        method: "DELETE",

        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const result =
      await response.json();

    if (
      !response.ok ||
      !result.success
    ) {
      throw new Error(
        result.message ||
          "Unable to remove favorite"
      );
    }

    window.dispatchEvent(
      new Event("favoritesUpdated")
    );

    return true;
  } catch (error) {
    console.error(
      "Remove favorite error:",
      error
    );

    throw error;
  }
};


/* =========================================
   TOGGLE FAVORITE
========================================= */

export const toggleFavorite = async (
  product
) => {
  try {
    const favorite =
      await isFavorite(product.id);

    if (favorite) {
      await removeFromFavorites(
        product.id
      );

      return false;
    }

    await addToFavorites(product);

    return true;
  } catch (error) {
    console.error(
      "Toggle favorite error:",
      error
    );

    throw error;
  }
};


/* =========================================
   FAVORITES COUNT
========================================= */

export const getFavoritesCount =
  async () => {
    try {
      const favorites =
        await getFavorites();

      return favorites.length;
    } catch (error) {
      console.error(
        "Get favorites count error:",
        error
      );

      return 0;
    }
  };