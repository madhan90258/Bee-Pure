const FAVORITES_KEY = "beePureFavorites";

// =========================================
// GET FAVORITES
// =========================================

export const getFavorites = () => {
  try {
    const favorites =
      localStorage.getItem(FAVORITES_KEY);

    return favorites
      ? JSON.parse(favorites)
      : [];
  } catch (error) {
    console.error(
      "Failed to load favorites:",
      error
    );

    return [];
  }
};


// =========================================
// CHECK FAVORITE
// =========================================

export const isFavorite = (productId) => {
  const favorites = getFavorites();

  return favorites.some(
    (product) =>
      Number(product.id) === Number(productId)
  );
};


// =========================================
// ADD FAVORITE
// =========================================

export const addToFavorites = (product) => {
  const favorites = getFavorites();

  const alreadyFavorite = favorites.some(
    (item) =>
      Number(item.id) === Number(product.id)
  );

  if (alreadyFavorite) {
    return favorites;
  }

  const updatedFavorites = [
    ...favorites,
    product,
  ];

  localStorage.setItem(
    FAVORITES_KEY,
    JSON.stringify(updatedFavorites)
  );

  window.dispatchEvent(
    new Event("favoritesUpdated")
  );

  return updatedFavorites;
};


// =========================================
// REMOVE FAVORITE
// =========================================

export const removeFromFavorites = (
  productId
) => {
  const favorites = getFavorites();

  const updatedFavorites = favorites.filter(
    (product) =>
      Number(product.id) !== Number(productId)
  );

  localStorage.setItem(
    FAVORITES_KEY,
    JSON.stringify(updatedFavorites)
  );

  window.dispatchEvent(
    new Event("favoritesUpdated")
  );

  return updatedFavorites;
};


// =========================================
// TOGGLE FAVORITE
// =========================================

export const toggleFavorite = (product) => {
  if (isFavorite(product.id)) {
    return removeFromFavorites(product.id);
  }

  return addToFavorites(product);
};


// =========================================
// FAVORITE COUNT
// =========================================

export const getFavoritesCount = () => {
  return getFavorites().length;
};