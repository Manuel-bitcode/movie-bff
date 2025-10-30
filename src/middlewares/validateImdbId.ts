import { Request, Response, NextFunction } from 'express';

/**
 * Middleware para validar formato de imdbId
 * Formato esperado: tt + 7 o más dígitos (ej: tt0111161, tt0372784)
 */
export const validateImdbId = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { imdbId } = req.params;

  // Regex: tt seguido de 7 o más dígitos
  const imdbIdRegex = /^tt\d{7,}$/;

  if (!imdbId) {
    res.status(400).json({
      success: false,
      message: 'imdbId parameter is required',
    });
    return;
  }

  if (!imdbIdRegex.test(imdbId)) {
    res.status(400).json({
      success: false,
      message: 'Invalid imdbId format. Expected format: tt1234567 (tt + at least 7 digits)',
    });
    return;
  }

  // Validación exitosa, continuar
  next();
};