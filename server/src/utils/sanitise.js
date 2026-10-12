// src/utils/sanitise.js
// ─────────────────────────────────────────────────────────────────────────────
// Serialisation helpers that strip PRIVATE fields before any public or
// customer API response.
//
// RULE: Every route handler in /api/public and /api/customer MUST pass
// product objects through sanitiseProduct() before responding.
// Admin routes (/api/admin) receive full objects.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Strip all PRIVATE fields from a product object (and its nested variants).
 * Safe to call on null/undefined.
 *
 * Removed: supplierId, supplier, sourceType, purchasePriceRef
 * Variant-level removed: purchaseCost
 *
 * @param {object|null} product
 * @returns {object|null}
 */
export function sanitiseProduct(product) {
  if (!product) return null;

  // Destructure away private fields
  // eslint-disable-next-line no-unused-vars
  const {
    supplierId,
    supplier,
    sourceType,
    purchasePriceRef,
    ...publicProduct
  } = product;

  // Sanitise nested variants
  if (Array.isArray(publicProduct.variants)) {
    publicProduct.variants = publicProduct.variants.map(sanitiseVariant);
  }

  return publicProduct;
}

/**
 * Strip PRIVATE fields from a single variant.
 * @param {object} variant
 * @returns {object}
 */
export function sanitiseVariant(variant) {
  if (!variant) return null;
  // eslint-disable-next-line no-unused-vars
  const { purchaseCost, ...publicVariant } = variant;
  return publicVariant;
}

/**
 * Strip PRIVATE fields from a user/customer profile before returning to
 * the customer themselves (they can see their own data, but not GST/PAN
 * in API responses — those are admin-only).
 *
 * Customer self-service receives: companyName, businessType, addresses,
 * alternatePhone, website — but NOT gstNumber, panNumber.
 *
 * @param {object|null} profile
 * @returns {object|null}
 */
export function sanitiseCustomerProfile(profile) {
  if (!profile) return null;
  // eslint-disable-next-line no-unused-vars
  const { gstNumber, panNumber, ...publicProfile } = profile;
  return publicProfile;
}

/**
 * Strip passwordHash from a user object before sending to any client.
 * @param {object|null} user
 * @returns {object|null}
 */
export function sanitiseUser(user) {
  if (!user) return null;
  // eslint-disable-next-line no-unused-vars
  const { passwordHash, ...publicUser } = user;
  return publicUser;
}

/**
 * Strip adminNotes from an order before returning to a customer.
 * @param {object|null} order
 * @returns {object|null}
 */
export function sanitiseOrderForCustomer(order) {
  if (!order) return null;
  // eslint-disable-next-line no-unused-vars
  const { adminNotes, idempotencyKey, ...customerOrder } = order;
  return customerOrder;
}
