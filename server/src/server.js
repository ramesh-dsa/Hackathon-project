import { env } from './config/env.js';
import app from './app.js';

const PORT = env.port || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running in ${env.nodeEnv} mode on port ${PORT}`);
  console.log(`👉 API Root: http://localhost:${PORT}/api/v1`);
});

// Graceful shutdown handlers
function gracefulShutdown(signal) {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(() => {
    console.log('HTTP server closed.');
    // Future: Close database connections here
    process.exit(0);
  });

  // Force close after 10s
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
