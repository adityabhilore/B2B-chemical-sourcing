import { errorResponse } from '../utils/apiResponse.js';
import { reportOperationalFailure } from '../utils/observability.js';

export function notFoundHandler(req, res) {
  res.status(404).json(errorResponse(`Route not found: ${req.method} ${req.path}`));
}

// Keep client messages useful while preventing internal stack/details from leaking in production.
export function errorHandler(err, req, res, _next) {
  if (res.headersSent) return;
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json(errorResponse('File too large'));
  }

  const status = err.statusCode ?? err.status ?? 500;
  const message = status >= 500 && process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : (err.message || 'Internal server error');
  const errors = err.errors ?? null;
  if (status >= 500) {
    const component = err.code?.startsWith?.('P') ? 'database' : err.code?.startsWith?.('LIMIT_') ? 'upload' : 'api';
    reportOperationalFailure(component, err, req.id);
  }
  return res.status(status).json({ ...errorResponse(message, errors), requestId: req.id || null });
}
