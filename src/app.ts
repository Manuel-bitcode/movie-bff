import express, { Express, Request, Response, NextFunction } from 'express';
import movieRoutes from './routes/movieRoutes';
import healthRoutes from './routes/healthRoutes';

const app: Express = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta default - Redirige a /api/movies
app.get('/', (_req: Request, res: Response) => {
  res.redirect('/api/movies');
});

// Routes
app.use('/api/movies', movieRoutes);
app.use('/health', healthRoutes);

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
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

