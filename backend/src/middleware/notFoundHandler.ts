import type { Request, Response, NextFunction } from 'express';

export const notFoundHandler = (
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const message = `Route ${req.originalUrl} not found`;
  
  res.status(404).json({
    success: false,
    error: {
      message,
      statusCode: 404
    }
  });
};
