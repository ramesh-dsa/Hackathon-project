import { Router } from 'express';

const router = Router();

// GET /api/v1 - API Root
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Skill Exchange API v1',
  });
});

// GET /api/v1/health - Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    timestamp: new Date().toISOString(),
  });
});

export default router;
