import { Controller, Get, Inject } from '@nestjs/common';
import { Public } from './common/decorators/public.decorator';
import { LoggerService } from './common/logger/logger.service';

/**
 * Application Root Controller
 *
 * Provides basic application information and health check endpoints
 * that don't require authentication.
 */
@Controller()
export class AppController {
  constructor(
    @Inject(LoggerService) private readonly logger: LoggerService,
  ) {
    this.logger.setContext('AppController');
  }

  /** Health check endpoint used by load balancers and monitoring tools */
  @Public()
  @Get('/health')
  health() {
    this.logger.logRequest('GET', '/health');
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.API_VERSION || '1.0.0',
    };
  }

  /** Readiness check endpoint to verify the app is ready to handle requests */
  @Public()
  @Get('/ready')
  ready() {
    this.logger.logRequest('GET', '/ready');
    return {
      ready: true,
      timestamp: new Date().toISOString(),
    };
  }

  /** Application info endpoint returning API metadata */
  @Public()
  @Get('/info')
  info() {
    this.logger.logRequest('GET', '/info');
    return {
      name: 'Scraping API',
      version: process.env.API_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
    };
  }
}
