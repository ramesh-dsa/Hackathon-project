import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { requestLogger } from './middleware/request-logger.middleware.js';
import { notFoundHandler } from './middleware/not-found.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';
import routes from './routes/index.js';

const app = express();

// 1. Security & CORS
app.use(cors({
  origin: env.clientUrl,
  credentials: true, // Prepare for future cookie-based auth
}));

// 2. Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Request Logging
app.use(requestLogger);

// 4. API Routes
app.use('/api/v1', routes);

// 5. 404 Handler (Runs if no route matched)
app.use(notFoundHandler);

// 6. Global Error Handler (Must be last)
app.use(errorHandler);

export default app;
