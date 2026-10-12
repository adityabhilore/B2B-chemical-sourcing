// src/lib/prisma.js
// ─────────────────────────────────────────────────────────────────────────────
// Singleton Prisma client.
// In development, attaches the instance to `global` to survive hot reloads
// (nodemon restarts the module but not the Node process, so this prevents
// exhausting the PostgreSQL connection pool during development).
// ─────────────────────────────────────────────────────────────────────────────

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "warn", "error"]
        : ["warn", "error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
