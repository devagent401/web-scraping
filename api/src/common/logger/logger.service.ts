import { Injectable, LoggerService as NestLoggerService, Scope } from '@nestjs/common';
import * as winston from 'winston';
import * as path from 'path';

/**
 * Custom Logger Service with Winston integration
 *
 * This service provides comprehensive logging capabilities with:
 * - Multiple log levels (error, warn, info, debug, verbose)
 * - Console and file output
 * - Structured logging with metadata
 * - Performance monitoring
 * - Request/Response tracking
 */
@Injectable({ scope: Scope.DEFAULT })
export class LoggerService implements NestLoggerService {
  private logger: winston.Logger;
  private context: string = 'Application';

  constructor() {
    this.logger = this.createWinstonLogger();
  }

  /**
   * Create and configure Winston logger instance
   */
  private createWinstonLogger(): winston.Logger {
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const logsDir = process.env.LOG_DIR || './logs';

    // Ensure logs directory exists
    require('fs').mkdirSync(logsDir, { recursive: true });

    const formats = [
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.splat(),
    ];

    // Add colorization in development
    if (isDevelopment) {
      formats.unshift(winston.format.colorize());
    }

    formats.push(
      winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
        const contextStr = context ? `[${context}]` : '';
        const metaStr = Object.keys(meta).length
          ? `\n${JSON.stringify(meta, null, 2)}`
          : '';
        return `${timestamp} [${level}] ${contextStr} ${message}${metaStr}`;
      }),
    );

    const transports: winston.transport[] = [
      // Console transport
      new winston.transports.Console({
        format: winston.format.combine(...formats),
        level: isDevelopment ? 'debug' : 'info',
      }),
    ];

    // File transports for all environments
    if (isDevelopment || process.env.LOG_TO_FILE === 'true') {
      transports.push(
        // Error logs
        new winston.transports.File({
          filename: path.join(logsDir, 'error.log'),
          level: 'error',
          format: winston.format.combine(
            winston.format.uncolorize(),
            ...formats,
          ),
        }),
        // Combined logs
        new winston.transports.File({
          filename: path.join(logsDir, 'combined.log'),
          format: winston.format.combine(
            winston.format.uncolorize(),
            ...formats,
          ),
        }),
      );
    }

    return winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      transports,
      exceptionHandlers: [
        new winston.transports.File({
          filename: path.join(logsDir, 'exceptions.log'),
        }),
      ],
      rejectionHandlers: [
        new winston.transports.File({
          filename: path.join(logsDir, 'rejections.log'),
        }),
      ],
    });
  }

  /**
   * Set the context for logging
   */
  setContext(context: string): void {
    this.context = context;
  }

  /**
   * Log error messages
   */
  error(message: string, trace?: string, context?: string): void {
    const ctx = context || this.context;
    if (trace) {
      this.logger.error(message, {
        context: ctx,
        stack: trace,
      });
    } else {
      this.logger.error(message, { context: ctx });
    }
  }

  /**
   * Log warning messages
   */
  warn(message: string, context?: string): void {
    const ctx = context || this.context;
    this.logger.warn(message, { context: ctx });
  }

  /**
   * Log info messages
   */
  log(message: string, context?: string): void {
    const ctx = context || this.context;
    this.logger.info(message, { context: ctx });
  }

  /**
   * Log debug messages
   */
  debug(message: string, context?: string): void {
    const ctx = context || this.context;
    this.logger.debug(message, { context: ctx });
  }

  /**
   * Log verbose messages
   */
  verbose(message: string, context?: string): void {
    const ctx = context || this.context;
    this.logger.verbose(message, { context: ctx });
  }

  /**
   * Log with metadata
   */
  logWithMeta(
    message: string,
    meta: Record<string, any>,
    level: 'error' | 'warn' | 'info' | 'debug' | 'verbose' = 'info',
    context?: string,
  ): void {
    const ctx = context || this.context;
    this.logger.log(level, message, {
      context: ctx,
      ...meta,
    });
  }

  /**
   * Log performance/duration
   */
  logPerformance(
    message: string,
    durationMs: number,
    context?: string,
  ): void {
    const ctx = context || this.context;
    const level = durationMs > 1000 ? 'warn' : 'debug';
    this.logger.log(level, message, {
      context: ctx,
      duration_ms: durationMs,
      is_slow: durationMs > 1000,
    });
  }

  /**
   * Log HTTP request
   */
  logRequest(
    method: string,
    path: string,
    query?: Record<string, any>,
    context?: string,
  ): void {
    const ctx = context || this.context;
    this.logger.info(`[${method}] ${path}`, {
      context: ctx,
      method,
      path,
      ...(query && Object.keys(query).length && { query }),
    });
  }

  /**
   * Log HTTP response
   */
  logResponse(
    method: string,
    path: string,
    statusCode: number,
    durationMs: number,
    context?: string,
  ): void {
    const ctx = context || this.context;
    const level = statusCode >= 400 ? 'warn' : 'debug';
    this.logger.log(level, `[${method}] ${path} - ${statusCode}`, {
      context: ctx,
      method,
      path,
      status_code: statusCode,
      duration_ms: durationMs,
    });
  }

  /**
   * Get the underlying Winston logger instance
   */
  getLogger(): winston.Logger {
    return this.logger;
  }
}
