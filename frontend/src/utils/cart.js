/* =========================================
   BEE PURE CART UTILITY
========================================= */

const CART_KEY = "beePureCart";


/* =========================================
   SAVE CART
   Updates localStorage + Navbar immediately
========================================= */

const saveCart = (cart) => {
  localStorage.setItem(
    CART_KEY,
    JSON.stringify(cart)
  );

  // Tell Navbar that the cart changed
  window.dispatchEvent(
    new Event("beePureCartUpdated")
  );
};


/* =========================================
   GET CART
========================================= */

export const getCart = () => {
  try {
    const savedCart = localStorage.getItem(
      CART_KEY
    );

    if (!savedCart) {
      return [];
    }

    const cart = JSON.parse(savedCart);

    if (!Array.isArray(cart)) {
      return [];
    }

    return cart;
  } catch (error) {
    console.error(
      "Error reading cart:",
      error
    );

    return [];
  }
};


/* =========================================
   ADD TO CART
========================================= */

export const addToCart = (product) => {
  const cart = getCart();

  const existingProductIndex = cart.findIndex(
    (item) =>
      String(item.id) === String(product.id)
  );

  if (existingProductIndex !== -1) {
    cart[existingProductIndex] = {
      ...cart[existingProductIndex],
      quantity:
        (Number(
          cart[existingProductIndex].quantity
        ) || 1) + 1,
    };
  } else {
    cart.push({
      ...product,
      quantity: 1,
    });
  }

  saveCart(cart);

  return cart;
};


/* =========================================
   UPDATE QUANTITY
========================================= */

export const updateCartQuantity = (
  productId,
  quantity
) => {
  const cart = getCart();

  const newQuantity = Number(quantity);

  const updatedCart = cart
    .map((item) => {
      if (
        String(item.id) ===
        String(productId)
      ) {
        return {
          ...item,
          quantity: newQuantity,
        };
      }

      return item;
    })
    .filter(
      (item) =>
        Number(item.quantity) > 0
    );

  saveCart(updatedCart);

  return updatedCart;
};


/* =========================================
   INCREASE QUANTITY
========================================= */

export const increaseCartQuantity = (
  productId
) => {
  const cart = getCart();

  const updatedCart = cart.map((item) => {
    if (
      String(item.id) ===
      String(productId)
    ) {
      return {
        ...item,
        quantity:
          (Number(item.quantity) || 1) + 1,
      };
    }

    return item;
  });

  saveCart(updatedCart);

  return updatedCart;
};


/* =========================================
   DECREASE QUANTITY
========================================= */

export const decreaseCartQuantity = (
  productId
) => {
  const cart = getCart();

  const updatedCart = cart
    .map((item) => {
      if (
        String(item.id) ===
        String(productId)
      ) {
        return {
          ...item,
          quantity:
            (Number(item.quantity) || 1) - 1,
        };
      }

      return item;
    })
    .filter(
      (item) =>
        Number(item.quantity) > 0
    );

  saveCart(updatedCart);

  return updatedCart;
};


/* =========================================
   REMOVE FROM CART
========================================= */

export const removeFromCart = (
  productId
) => {
  const cart = getCart();

  const updatedCart = cart.filter(
    (item) =>
      String(item.id) !==
      String(productId)
  );

  saveCart(updatedCart);

  return updatedCart;
};


/* =========================================
   CLEAR CART
========================================= */

export const clearCart = () => {
  localStorage.removeItem(CART_KEY);

  // Tell Navbar immediately
  window.dispatchEvent(
    new Event("beePureCartUpdated")
  );
};


/* =========================================
   GET CART ITEM COUNT
========================================= */

export const getCartCount = () => {
  const cart = getCart();

  return cart.reduce(
    (total, item) =>
      total +
      (Number(item.quantity) || 1),
    0
  );
};


/* =========================================
   GET CART TOTAL
========================================= */

export const getCartTotal = () => {
  const cart = getCart();

  return cart.reduce(
    (total, item) => {
      const price =
        Number(item.price) || 0;

      const quantity =
        Number(item.quantity) || 1;

      return total + price * quantity;
    },
    0
  );
};


/* =========================================
   CHECK IF PRODUCT IS IN CART
========================================= */

export const isInCart = (
  productId
) => {
  const cart = getCart();

  return cart.some(
    (item) =>
      String(item.id) ===
      String(productId)
  );
};


/* =========================================
   GET PRODUCT QUANTITY
========================================= */

export const getProductQuantity = (
  productId
) => {
  const cart = getCart();

  const item = cart.find(
    (product) =>
      String(product.id) ===
      String(productId)
  );

  return item
    ? Number(item.quantity) || 0
    : 0;
};