import { Controller, Get, Inject } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Public } from './common/decorators/public.decorator';
import { LoggerService } from './common/logger/logger.service';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(
    @Inject(LoggerService) private readonly logger: LoggerService,
  ) {
    this.logger.setContext('AppController');
  }

  @Public()
  @Get('/health')
  @ApiOperation({ summary: 'Liveness health check' })
  @ApiResponse({ status: 200, description: 'Service is up' })
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

  @Public()
  @Get('/ready')
  @ApiOperation({ summary: 'Readiness check' })
  @ApiResponse({ status: 200, description: 'Service is ready' })
  ready() {
    this.logger.logRequest('GET', '/ready');
    return {
      ready: true,
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Get('/info')
  @ApiOperation({ summary: 'Application metadata' })
  @ApiResponse({ status: 200, description: 'API name, version, environment' })
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
