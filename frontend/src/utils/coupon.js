// =========================================
// SELLER COUPONS
// =========================================
//
// These are the coupons currently created
// by the seller.
//
// Later, this can be replaced with coupons
// loaded from your seller/admin backend.
//

const SELLER_COUPONS = [
  {
    code: "BEEPURE10",
    type: "percentage",
    value: 10,
    minimumOrder: 500,
    maximumDiscount: 200,
    active: true,
    expiresAt: "2026-12-31",
  },

  {
    code: "WELCOME100",
    type: "fixed",
    value: 100,
    minimumOrder: 799,
    maximumDiscount: null,
    active: true,
    expiresAt: "2026-12-31",
  },
];


// =========================================
// VALIDATE COUPON
// =========================================

export function validateCoupon(code, subtotal) {
  const enteredCode = code.trim().toUpperCase();

  if (!enteredCode) {
    return {
      valid: false,
      message: "Please enter a coupon code.",
    };
  }

  const coupon = SELLER_COUPONS.find(
    (item) => item.code === enteredCode
  );

  // Coupon does not exist
  if (!coupon) {
    return {
      valid: false,
      message: "Invalid coupon code.",
    };
  }

  // Coupon disabled
  if (!coupon.active) {
    return {
      valid: false,
      message: "This coupon is no longer active.",
    };
  }

  // Expiry
  const today = new Date();
  const expiryDate = new Date(coupon.expiresAt);

  if (today > expiryDate) {
    return {
      valid: false,
      message: "This coupon has expired.",
    };
  }

  // Minimum order
  if (subtotal < coupon.minimumOrder) {
    return {
      valid: false,
      message: `Minimum order value is ₹${coupon.minimumOrder}.`,
    };
  }

  // Calculate discount
  let discount = 0;

  if (coupon.type === "percentage") {
    discount = (subtotal * coupon.value) / 100;

    if (
      coupon.maximumDiscount !== null &&
      discount > coupon.maximumDiscount
    ) {
      discount = coupon.maximumDiscount;
    }
  }

  if (coupon.type === "fixed") {
    discount = coupon.value;
  }

  // Never discount more than subtotal
  discount = Math.min(discount, subtotal);

  return {
    valid: true,
    coupon: {
      ...coupon,
      discount,
    },
  };
}