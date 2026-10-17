import morgan from 'morgan';

morgan.token('request-id', req => req.id || '-');

// Deliberately omit URL, headers, and body: URLs may carry reset tokens and
// request bodies may contain passwords or personal information.
export const requestLogger = morgan(':request-id :method :status :response-time ms :res[content-length]', {
  skip: (req) => req.path === '/health' || req.path === '/api/health',
});
