import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * Validates required environment variables
 * @param {string[]} requiredVars 
 */
function validateEnv(requiredVars) {
  const missing = requiredVars.filter(envVar => !process.env[envVar]);
  if (missing.length > 0) {
    console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
}

// Ensure critical variables are present
validateEnv(['PORT', 'NODE_ENV', 'CLIENT_URL']);

export const env = {
  port: parseInt(process.env.PORT, 10),
  nodeEnv: process.env.NODE_ENV,
  clientUrl: process.env.CLIENT_URL,
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
};
