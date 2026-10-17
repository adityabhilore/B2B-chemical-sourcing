import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';

const context = new AsyncLocalStorage();
const safeId = value => typeof value === 'string' && /^[A-Za-z0-9._-]{1,80}$/.test(value) ? value : randomUUID();

export function requestContextMiddleware(req, res, next) {
  const requestId = safeId(req.get('x-request-id'));
  req.id = requestId;
  res.setHeader('X-Request-ID', requestId);
  context.run({ requestId }, next);
}

export const currentRequestId = () => context.getStore()?.requestId || null;
