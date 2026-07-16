import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  private logger = new Logger(RequestIdMiddleware.name);

  use(req: Request, res: Response, next: NextFunction): void {
    const requestId = req.headers['x-request-id'] as string || randomUUID();

    // Add request ID to response headers
    res.setHeader('x-request-id', requestId);

    // Store in request for later use
    (req as any).id = requestId;

    // Log request
    this.logger.log(`[${requestId}] ${req.method} ${req.path}`);

    // Log response on finish
    res.on('finish', () => {
      this.logger.log(`[${requestId}] Response: ${res.statusCode}`);
    });

    next();
  }
}
