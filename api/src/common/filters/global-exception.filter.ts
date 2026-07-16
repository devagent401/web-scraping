import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Global Exception Filter
 *
 * This filter catches and handles all exceptions globally, providing a consistent
 * error response format across the entire application.
 *
 * Features:
 * - Catches both HTTP and non-HTTP exceptions
 * - Provides consistent error response format
 * - Logs errors appropriately based on severity
 * - Sanitizes error messages in production
 * - Includes request tracking information
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);
  private readonly isProduction = process.env.NODE_ENV === 'production';

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { statusCode, message, error } = this.parseException(exception);
    const requestId = this.getRequestId(request);

    // Log the error
    this.logError(exception, statusCode, request, requestId);

    // Send error response
    response.status(statusCode).json({
      statusCode,
      message: this.sanitizeMessage(message, statusCode),
      error: this.sanitizeError(error, statusCode),
      timestamp: new Date().toISOString(),
      path: request.path,
      method: request.method,
      ...(requestId && { requestId }),
    });
  }

  /**
   * Parse exception and extract status code and message
   */
  private parseException(exception: unknown): {
    statusCode: number;
    message: string;
    error: string;
  } {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object') {
        const exceptionObject = exceptionResponse as Record<string, any>;
        return {
          statusCode: status,
          message: exceptionObject.message || exception.message,
          error: exceptionObject.error || this.getErrorType(status),
        };
      }

      return {
        statusCode: status,
        message: exceptionResponse as string,
        error: this.getErrorType(status),
      };
    }

    if (exception instanceof Error) {
      // Handle known error types
      if (exception.name === 'ValidationError') {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Validation failed',
          error: 'BadRequestException',
        };
      }

      if (exception.name === 'UnauthorizedError') {
        return {
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'Unauthorized',
          error: 'UnauthorizedException',
        };
      }

      if (exception.name === 'NotFoundError') {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Resource not found',
          error: 'NotFoundException',
        };
      }

      if (exception.name === 'ConflictError') {
        return {
          statusCode: HttpStatus.CONFLICT,
          message: 'Resource conflict',
          error: 'ConflictException',
        };
      }

      // Timeout errors
      if (
        exception.name === 'TimeoutError' ||
        exception.message.includes('timeout')
      ) {
        return {
          statusCode: HttpStatus.GATEWAY_TIMEOUT,
          message: 'Request timeout',
          error: 'GatewayTimeoutException',
        };
      }

      // Database errors
      if (exception.name === 'QueryFailedError') {
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Database error',
          error: 'DatabaseException',
        };
      }
    }

    // Unknown error
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      error: 'InternalServerErrorException',
    };
  }

  /**
   * Get error type name based on status code
   */
  private getErrorType(statusCode: number): string {
    const statusMap: Record<number, string> = {
      [HttpStatus.BAD_REQUEST]: 'BadRequestException',
      [HttpStatus.UNAUTHORIZED]: 'UnauthorizedException',
      [HttpStatus.FORBIDDEN]: 'ForbiddenException',
      [HttpStatus.NOT_FOUND]: 'NotFoundException',
      [HttpStatus.CONFLICT]: 'ConflictException',
      [HttpStatus.UNPROCESSABLE_ENTITY]: 'UnprocessableEntityException',
      [HttpStatus.INTERNAL_SERVER_ERROR]: 'InternalServerErrorException',
      [HttpStatus.SERVICE_UNAVAILABLE]: 'ServiceUnavailableException',
      [HttpStatus.GATEWAY_TIMEOUT]: 'GatewayTimeoutException',
    };

    return statusMap[statusCode] || 'Exception';
  }

  /**
   * Sanitize error message based on environment
   */
  private sanitizeMessage(message: string | string[], statusCode: number): string {
    // In production, hide internal error details for 5xx errors
    if (this.isProduction && statusCode >= 500) {
      return 'An internal server error occurred. Please try again later.';
    }

    if (Array.isArray(message)) {
      return message.join(', ');
    }

    return message;
  }

  /**
   * Sanitize error object based on environment
   */
  private sanitizeError(error: string, statusCode: number): string | null {
    // In production, hide internal error details for 5xx errors
    if (this.isProduction && statusCode >= 500) {
      return null;
    }

    return error;
  }

  /**
   * Get request ID from request or generate one
   */
  private getRequestId(request: Request): string | null {
    // Try to get request ID from various common headers
    const requestId =
      (request.headers['x-request-id'] as string) ||
      (request.headers['x-correlation-id'] as string) ||
      null;

    return requestId;
  }

  /**
   * Log error with appropriate level
   */
  private logError(
    exception: unknown,
    statusCode: number,
    request: Request,
    requestId: string | null,
  ): void {
    const message = `[${request.method}] ${request.path}`;
    const meta = {
      statusCode,
      path: request.path,
      method: request.method,
      ...(requestId && { requestId }),
      error: exception instanceof Error ? exception.message : String(exception),
    };

    // Log 5xx as errors, 4xx as warnings
    if (statusCode >= 500) {
      this.logger.error(message, meta);
    } else if (statusCode >= 400) {
      this.logger.warn(message, meta);
    } else {
      this.logger.debug(message, meta);
    }
  }
}
