import { prisma } from '../lib/prisma.js';

// Audit records intentionally contain only the changed business fields supplied by callers.
export async function writeAuditLog({ userId = null, action, entity, entityId, before = null, after = null }) {
  try {
    if (!prisma.auditLog?.create) return null;
    return await prisma.auditLog.create({
      data: { userId, action, entity, entityId: String(entityId), before, after },
    });
  } catch (error) {
    // A logging outage should not turn a completed business action into a failed API response.
    console.error('[audit] Could not write audit record', error.message);
    return null;
  }
}
