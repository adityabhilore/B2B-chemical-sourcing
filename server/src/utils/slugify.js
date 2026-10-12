// src/utils/slugify.js
// ─────────────────────────────────────────────────────────────────────────────
// Simple slug generator — converts a string to URL-safe lowercase kebab-case.
// No external dependency needed.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Convert a string to a URL-safe slug.
 * Examples:
 *   "Methanol 99.9%" → "methanol-99-9"
 *   "Chlorinated Solvents (Industrial)" → "chlorinated-solvents-industrial"
 *
 * @param {string} text
 * @returns {string}
 */
export function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // remove non-word chars (except hyphens)
    .replace(/[\s_]+/g, "-")  // spaces and underscores → hyphen
    .replace(/-+/g, "-")       // collapse multiple hyphens
    .replace(/^-|-$/g, "");    // trim leading/trailing hyphens
}

/**
 * Ensure a slug is unique by appending a suffix if needed.
 * Pass a checker function that returns true if the slug already exists.
 *
 * @param {string} base           The initial slug.
 * @param {(slug: string) => Promise<boolean>} exists  Async check function.
 * @returns {Promise<string>}
 */
export async function uniqueSlug(base, exists) {
  let slug = base;
  let i = 2;
  while (await exists(slug)) {
    slug = `${base}-${i++}`;
  }
  return slug;
}
