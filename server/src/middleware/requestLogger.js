import morgan from 'morgan';

// Deliberately omit URL, headers, and body: URLs may carry reset tokens and
// request bodies may contain passwords or personal information.
export const requestLogger = morgan(':method :status :response-time ms :res[content-length]', {
  skip: (req) => req.path === '/health' || req.path === '/api/health',
});
