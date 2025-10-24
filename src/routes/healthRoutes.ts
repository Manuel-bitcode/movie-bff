import { Router, Request, Response } from 'express';

const router = Router();

interface HealthResponse {
  status: string;
  timestamp: string;
  service: string;
}

// Health check endpoint
router.get('/', (_req: Request, res: Response<HealthResponse>) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'movie-bff'
  });
});

export default router;

