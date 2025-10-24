import { Request, Response, NextFunction } from 'express';

/**
 * Middleware de logging para registrar peticiones HTTP
 */
export const logger = (req: Request, _res: Response, next: NextFunction): void => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const ip = req.ip || req.socket.remoteAddress;

  console.log(`[${timestamp}] ${method} ${url} - IP: ${ip}`);
  
  next();
};
