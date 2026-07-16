import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';

// Configuration
import configuration from './config/configuration';

// Database
import { DatabaseModule } from './database/database.module';

// Logger
import { LoggerModule } from './common/logger/logger.module';

// Middleware
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';

// Feature Modules
import { AuthModule } from './modules/auth/auth.module';
import { ProductsModule } from './modules/products/products.module';
import { SearchModule } from './modules/search/search.module';
import { ShopsModule } from './modules/shops/shops.module';
import { ProvidersModule } from './modules/providers/providers.module';
import { CacheModule } from './modules/cache/cache.module';
import { QueueModule } from './modules/queue/queue.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AdminModule } from './modules/admin/admin.module';

// Controllers
import { AppController } from './app.controller';

/**
 * AppModule - Root Application Module
 *
 * This is the root module that orchestrates all other modules in the application.
 * It is structured for scalability and maintainability:
 *
 * 1. Configuration Layer:
 *    - ConfigModule: Centralized environment variable management
 *    - Configuration: Typed configuration object
 *    - Validators: Configuration validation using Joi
 *
 * 2. Core Infrastructure:
 *    - LoggerModule: Global logger service (Winston + NestJS Logger)
 *    - DatabaseModule: Prisma ORM and database connectivity
 *    - TerminusModule: Health checks and readiness probes
 *
 * 3. Feature Modules (Organized by domain):
 *    - Authentication & Authorization (Auth)
 *    - Product Management (Products, Search)
 *    - Shop Management (Shops, Providers)
 *    - Caching & Performance (Cache, Queue)
 *    - Background Processing (Jobs)
 *    - User Engagement (Notifications)
 *    - Administrative Features (Admin)
 *
 * Module Dependencies:
 *    - All modules depend on Config & Logger (global)
 *    - Feature modules may depend on Database & Cache
 *    - Admin module depends on all other feature modules
 *
 * Scalability Considerations:
 *    - Use feature modules to organize code by domain
 *    - Use lazy loading for rarely used features
 *    - Use separate microservices for independent features
 *    - Use shared services in common/ for cross-cutting concerns
 */
@Module({
  imports: [
    // Health check module - must be included

    // ============================================
    // CONFIGURATION LAYER
    // ============================================
    ConfigModule.forRoot({
      // Load environment variables from .env files
      envFilePath: [
        `.env.${process.env.NODE_ENV}`,
        '.env',
        '.env.development',
      ],
      // Load typed configuration
      load: [configuration],
      // Make ConfigService global
      isGlobal: true,
      // Cache configuration module
      cache: true,
      // Ignore .env files in production if they don't exist
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),

    // ============================================
    // CORE INFRASTRUCTURE
    // ============================================
    LoggerModule, // Global logger - must come after ConfigModule
    DatabaseModule, // Database connectivity via Prisma
    TerminusModule, // Health checks

    // ============================================
    // FEATURE MODULES
    // ============================================
    // Authentication & Authorization
    AuthModule,

    // Product Management
    ProductsModule,
    SearchModule,

    // Shop & Provider Management
    ShopsModule,
    ProvidersModule,

    // Caching & Queue Management
    CacheModule,
    QueueModule,

    // Background Jobs
    JobsModule,

    // Notifications
    NotificationsModule,

    // Administrative Features
    AdminModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
