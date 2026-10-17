import { currentRequestId } from './requestContext.js';

const errorCode = error => {
  const code = error?.code;
  return typeof code === 'string' && /^[A-Z0-9_-]{1,40}$/.test(code) ? code : undefined;
};

export function reportOperationalFailure(component, error, requestId = currentRequestId()) {
  const event = {
    timestamp: new Date().toISOString(),
    level: 'error',
    event: 'operational_failure',
    component,
    requestId: requestId || undefined,
    errorType: typeof error?.name === 'string' ? error.name : 'Error',
    errorCode: errorCode(error),
  };
  console.error(JSON.stringify(event));

  const webhook = process.env.OPS_ALERT_WEBHOOK;
  if (webhook) {
    fetch(webhook, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(event),
      signal: AbortSignal.timeout(2000),
    }).catch(() => {});
  }
}
