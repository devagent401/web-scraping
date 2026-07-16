import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  RequestTimeoutException,
  Inject,
  Optional,
} from '@nestjs/common';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { Request } from 'express';
import { LoggerService } from '../logger/logger.service';

/**
 * Timeout Interceptor
 *
 * Enforces a timeout on all HTTP requests
 * Prevents requests from hanging indefinitely
 * Default timeout: 60 seconds (configurable via env)
 */
@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  private readonly requestTimeout: number;

  constructor(
    @Optional()
    @Inject(LoggerService)
    private readonly logger?: LoggerService,
  ) {
    // Get timeout from environment or use default (60 seconds)
    this.requestTimeout = parseInt(process.env.REQUEST_TIMEOUT || '60000', 10);
  }

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, path } = request;

    return next.handle().pipe(
      timeout(this.requestTimeout),
      catchError((error) => {
        if (error instanceof TimeoutError) {
          if (this.logger) {
            this.logger.warn(
              `[${method}] ${path} - Request timeout after ${this.requestTimeout}ms`,
              'TimeoutInterceptor',
            );
          }
          return throwError(
            () =>
              new RequestTimeoutException(
                `Request timeout after ${this.requestTimeout}ms`,
              ),
          );
        }
        return throwError(() => error);
      }),
    );
  }
}
