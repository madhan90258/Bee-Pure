const CART_KEY = "beePureCart";

// Get cart
export function getCart() {
  const savedCart = localStorage.getItem(CART_KEY);

  if (!savedCart) {
    return [];
  }

  try {
    return JSON.parse(savedCart);
  } catch (error) {
    console.error("Cart error:", error);
    return [];
  }
}

// Save cart
export function saveCart(cart) {
  localStorage.setItem(
    CART_KEY,
    JSON.stringify(cart)
  );

  window.dispatchEvent(
    new Event("cartUpdated")
  );
}

// Add product
export function addToCart(product) {
  const cart = getCart();

  const existingProduct = cart.find(
    (item) => item.id === product.id
  );

  if (existingProduct) {
    existingProduct.quantity += 1;
  } else {
    cart.push({
      ...product,
      quantity: 1,
    });
  }

  saveCart(cart);

  console.log("Added to cart:", product.name);

  return cart;
}

// Remove product
export function removeFromCart(productId) {
  const cart = getCart();

  const updatedCart = cart.filter(
    (item) => item.id !== productId
  );

  saveCart(updatedCart);

  return updatedCart;
}

// Update quantity
export function updateCartQuantity(
  productId,
  quantity
) {
  const cart = getCart();

  const updatedCart = cart.map((item) => {
    if (item.id === productId) {
      return {
        ...item,
        quantity: Math.max(1, quantity),
      };
    }

    return item;
  });

  saveCart(updatedCart);

  return updatedCart;
}

// Clear cart
export function clearCart() {
  localStorage.removeItem(CART_KEY);

  window.dispatchEvent(
    new Event("cartUpdated")
  );
}

// Total items
export function getCartItemCount() {
  const cart = getCart();

  return cart.reduce(
    (total, item) => total + item.quantity,
    0
  );
}

// Total price
export function getCartTotal() {
  const cart = getCart();

  return cart.reduce(
    (total, item) =>
      total + item.price * item.quantity,
    0
  );
}