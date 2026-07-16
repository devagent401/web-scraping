import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
  Optional,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { LoggerService } from '../logger/logger.service';

/**
 * Logging Interceptor
 *
 * Logs all HTTP requests and responses with timing information
 * Provides insights into request processing duration
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    @Optional()
    @Inject(LoggerService)
    private readonly logger?: LoggerService,
  ) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();

    const now = Date.now();
    const { method, path, query } = request;

    // Log incoming request
    if (this.logger) {
      this.logger.logRequest(method, path, query as any, 'LoggingInterceptor');
    }

    return next.handle().pipe(
      tap({
        next: () => {
          const elapsed = Date.now() - now;
          if (this.logger) {
            this.logger.logResponse(
              method,
              path,
              response.statusCode,
              elapsed,
              'LoggingInterceptor',
            );
          }
        },
        error: (error: Error) => {
          const elapsed = Date.now() - now;
          if (this.logger) {
            this.logger.error(
              `[${method}] ${path} - Error after ${elapsed}ms`,
              error.stack,
              'LoggingInterceptor',
            );
          }
        },
      }),
    );
  }
}
