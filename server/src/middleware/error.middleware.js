import { env } from '../config/env.js';

export function errorHandler(err, req, res, next) {
  console.error(`[Error] ${err.name}: ${err.message}`, err.stack);

  const statusCode = err.statusCode || 500;
  
  res.status(statusCode).json({
    success: false,
    error: {
      message: env.isProduction && statusCode === 500 ? 'Internal Server Error' : err.message,
      // Only include stack trace in development
      ...(env.isDevelopment && { stack: err.stack }),
    },
  });
}
