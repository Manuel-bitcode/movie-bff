import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { logger } from './middlewares/logger';
import movieRoutes from './routes/movieRoutes';
import likesTotalRoutes from './routes/likesTotalRoutes';
import healthRoutes from './routes/healthRoutes';

const app: Express = express();

// CORS - Permitir peticiones desde otros orígenes
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middlewares
app.use(logger); // Logger middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta default - Redirige a /api/movies
app.get('/', (_req: Request, res: Response) => {
  res.redirect('/api/movies');
});

// Routes
app.use('/health', healthRoutes);
app.use('/api/likes', likesTotalRoutes);
app.use('/api/movies', movieRoutes);

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      status: 404
    }
  });
});

export default app;

