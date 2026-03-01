import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export const validateDto = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate the entire request object to support body, query, and params validation
      const validated = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params
      }) as any;

      // Update the request objects with parsed/transformed data
      if (validated.body) req.body = validated.body;
      if (validated.query) req.query = validated.query;
      if (validated.params) req.params = validated.params;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      next(error);
    }
  };
};

export default validateDto;