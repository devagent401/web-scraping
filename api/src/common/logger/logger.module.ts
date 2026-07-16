import { Module, Global } from '@nestjs/common';
import { LoggerService } from './logger.service';

/**
 * Global Logger Module
 *
 * Provides centralized logging service throughout the application
 * This module is marked as @Global() to make the LoggerService
 * available in all modules without explicit imports
 */
@Global()
@Module({
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
