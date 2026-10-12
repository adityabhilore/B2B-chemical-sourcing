// src/utils/pagination.js
// ─────────────────────────────────────────────────────────────────────────────
// Shared pagination helper — parses ?page= and ?limit= from query params and
// returns Prisma-compatible skip/take + a meta object for the response.
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * Parse pagination params from Express request query.
 *
 * @param {object} query   req.query
 * @returns {{ skip: number, take: number, page: number, limit: number }}
 */
export function parsePagination(query) {
  const page = Math.max(1, parseInt(query.page ?? "1", 10) || 1);
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, parseInt(query.limit ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT)
  );
  return {
    skip: (page - 1) * limit,
    take: limit,
    page,
    limit,
  };
}

/**
 * Build a standardised pagination meta object for API responses.
 *
 * @param {{ page: number, limit: number, total: number }} opts
 * @returns {{ page, limit, total, totalPages, hasNext, hasPrev }}
 */
export function buildMeta({ page, limit, total }) {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}
