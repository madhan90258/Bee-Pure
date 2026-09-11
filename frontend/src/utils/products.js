// =====================================================
// BEE PURE - SHARED PRODUCT STORE
// =====================================================

export const PRODUCTS_STORAGE_KEY =
  "beePureSellerProducts";

export const PRODUCTS_UPDATED_EVENT =
  "beePureProductsUpdated";


// =====================================================
// DEFAULT PRODUCTS
// =====================================================

export const defaultProducts = [
  {
    id: 1,

    name: "Pure Forest Honey",

    description:
      "Pure forest honey collected naturally from trusted local beekeepers. Rich in natural goodness, flavour and nutrients.",

    category: "Honey",

    price: 499,

    oldPrice: 599,

    image: "/products/forest-honey.jpg",

    images: [
      "/products/forest-honey.jpg",
    ],

    videos: [],

    stockStatus: "in-stock",

    stockCount: 25,

    rating: 5,
  },

  {
    id: 2,

    name: "Raw Organic Honey",

    description:
      "Naturally raw and minimally processed honey sourced directly from trusted farmers.",

    category: "Honey",

    price: 399,

    oldPrice: null,

    image: "/products/raw-honey.jpg",

    images: [
      "/products/raw-honey.jpg",
    ],

    videos: [],

    stockStatus: "in-stock",

    stockCount: 18,

    rating: 5,
  },

  {
    id: 3,

    name: "Natural Jaggery",

    description:
      "Traditional natural jaggery made with care and sourced directly from local producers.",

    category: "Natural Sweeteners",

    price: 249,

    oldPrice: 299,

    image: "/products/jaggery.jpg",

    images: [
      "/products/jaggery.jpg",
    ],

    videos: [],

    stockStatus: "in-stock",

    stockCount: 30,

    rating: 4,
  },

  {
    id: 4,

    name: "Organic Turmeric",

    description:
      "Naturally grown turmeric with rich colour, flavour and everyday wellness benefits.",

    category: "Healthy Foods",

    price: 199,

    oldPrice: null,

    image: "/products/turmeric.jpg",

    images: [
      "/products/turmeric.jpg",
    ],

    videos: [],

    stockStatus: "in-stock",

    stockCount: 40,

    rating: 5,
  },

  {
    id: 5,

    name: "Organic A2 Ghee",

    description:
      "Traditional A2 ghee made from quality milk and prepared with care.",

    category: "Healthy Foods",

    price: 699,

    oldPrice: 799,

    image: "/products/ghee.jpg",

    images: [
      "/products/ghee.jpg",
    ],

    videos: [],

    stockStatus: "in-stock",

    stockCount: 12,

    rating: 5,
  },

  {
    id: 6,

    name: "Forest Bee Honey",

    description:
      "Authentic forest honey with a naturally rich taste, sourced from local beekeepers.",

    category: "Honey",

    price: 549,

    oldPrice: null,

    image: "/products/forest-bee-honey.jpg",

    images: [
      "/products/forest-bee-honey.jpg",
    ],

    videos: [],

    stockStatus: "in-stock",

    stockCount: 20,

    rating: 5,
  },
];


// =====================================================
// NORMALIZE PRODUCT
// =====================================================

export const normalizeProduct = (product) => {

  const images =
    Array.isArray(product.images) &&
    product.images.length > 0
      ? product.images
      : product.image
        ? [product.image]
        : [];

  return {
    ...product,

    id: product.id,

    name:
      product.name ||
      "Untitled Product",

    description:
      product.description || "",

    category:
      product.category ||
      "Uncategorized",

    price:
      Number(product.price) || 0,

    oldPrice:
      product.oldPrice === null ||
      product.oldPrice === undefined ||
      product.oldPrice === ""
        ? null
        : Number(product.oldPrice),

    image:
      product.image ||
      images[0] ||
      "",

    images,

    videos:
      Array.isArray(product.videos)
        ? product.videos
        : [],

    stockStatus:
      product.stockStatus ||
      "in-stock",

    stockCount:
      Number(product.stockCount) || 0,

    rating:
      Number(product.rating) || 5,
  };
};


// =====================================================
// GET PRODUCTS
// =====================================================

export const getProducts = () => {

  try {

    const savedProducts =
      localStorage.getItem(
        PRODUCTS_STORAGE_KEY
      );


    // -----------------------------------------------
    // FIRST LOAD
    // -----------------------------------------------

    if (!savedProducts) {

      const products =
        defaultProducts.map(
          normalizeProduct
        );

      localStorage.setItem(
        PRODUCTS_STORAGE_KEY,
        JSON.stringify(products)
      );

      return products;
    }


    // -----------------------------------------------
    // PARSE
    // -----------------------------------------------

    const parsedProducts =
      JSON.parse(savedProducts);


    if (!Array.isArray(parsedProducts)) {

      return defaultProducts.map(
        normalizeProduct
      );
    }


    return parsedProducts.map(
      normalizeProduct
    );

  } catch (error) {

    console.error(
      "Bee Pure product loading error:",
      error
    );

    return defaultProducts.map(
      normalizeProduct
    );
  }
};


// =====================================================
// SAVE PRODUCTS
// =====================================================

export const saveProducts = (
  products
) => {

  const normalizedProducts =
    products.map(
      normalizeProduct
    );

  localStorage.setItem(
    PRODUCTS_STORAGE_KEY,
    JSON.stringify(
      normalizedProducts
    )
  );


  // IMPORTANT:
  // Notify every page/component.

  window.dispatchEvent(
    new Event(
      PRODUCTS_UPDATED_EVENT
    )
  );


  // Also return the saved products.

  return normalizedProducts;
};


// =====================================================
// GET PRODUCT BY ID
// =====================================================

export const getProductById = (
  productId
) => {

  const products =
    getProducts();

  return products.find(
    (product) =>
      String(product.id) ===
      String(productId)
  );
};


// =====================================================
// PRODUCT COUNT
// =====================================================

export const getProductCount = () => {

  return getProducts().length;
};


// =====================================================
// CATEGORY COUNT
// =====================================================

export const getCategoryCount = () => {

  const products =
    getProducts();

  const categories =
    new Set(
      products
        .map(
          (product) =>
            product.category
        )
        .filter(Boolean)
    );

  return categories.size;
};


// =====================================================
// REMOVE PRODUCT FROM CART + FAVORITES
// =====================================================

export const removeProductFromCustomerData = (
  productId
) => {

  // -------------------------------------------------
  // CART
  // -------------------------------------------------

  try {

    const savedCart =
      JSON.parse(
        localStorage.getItem(
          "beePureCart"
        )
      ) || [];

    const updatedCart =
      savedCart.filter(
        (item) =>
          String(item.id) !==
          String(productId)
      );

    localStorage.setItem(
      "beePureCart",
      JSON.stringify(
        updatedCart
      )
    );


    window.dispatchEvent(
      new Event(
        "beePureCartUpdated"
      )
    );

    window.dispatchEvent(
      new Event(
        "cartUpdated"
      )
    );

  } catch (error) {

    console.error(
      "Cart cleanup error:",
      error
    );
  }


  // -------------------------------------------------
  // FAVORITES
  // -------------------------------------------------

  try {

    const savedFavorites =
      JSON.parse(
        localStorage.getItem(
          "beePureFavorites"
        )
      ) || [];

    const updatedFavorites =
      savedFavorites.filter(
        (item) =>
          String(item.id) !==
          String(productId)
      );

    localStorage.setItem(
      "beePureFavorites",
      JSON.stringify(
        updatedFavorites
      )
    );


    window.dispatchEvent(
      new Event(
        "favoritesUpdated"
      )
    );

  } catch (error) {

    console.error(
      "Favorites cleanup error:",
      error
    );
  }
};


// =====================================================
// PRODUCT EVENT LISTENER HELPER
// =====================================================

export const subscribeToProducts = (
  callback
) => {

  const handleUpdate = () => {
    callback(getProducts());
  };


  // Initial load

  handleUpdate();


  // Same-tab update

  window.addEventListener(
    PRODUCTS_UPDATED_EVENT,
    handleUpdate
  );


  // Other-tab update

  window.addEventListener(
    "storage",
    handleUpdate
  );


  // Cleanup

  return () => {

    window.removeEventListener(
      PRODUCTS_UPDATED_EVENT,
      handleUpdate
    );

    window.removeEventListener(
      "storage",
      handleUpdate
    );

  };
};