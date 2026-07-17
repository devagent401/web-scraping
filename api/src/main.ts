import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor';
import { LoggerService } from './common/logger/logger.service';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // Initialize logger service
  const loggerService = app.get(LoggerService);
  app.useLogger(loggerService);

  const port = process.env.APP_PORT || process.env.PORT || 4001;
  const apiVersion = process.env.API_VERSION || '1.0.0';
  const nodeEnv = process.env.NODE_ENV || 'development';

  // ============================================
  // SECURITY MIDDLEWARE
  // ============================================
  // Relax CSP so Swagger UI assets load correctly
  app.use(
    helmet({
      contentSecurityPolicy: nodeEnv === 'production' ? undefined : false,
    }),
  );
  app.use(cookieParser());

  // Note: RequestIdMiddleware is registered in AppModule via NestModule.configure()

  // ============================================
  // GLOBAL CONFIGURATION
  // ============================================
  // API Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'v',
  });

  // Global prefix for all routes
  app.setGlobalPrefix('api');

  // CORS configuration
  const corsOrigin = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
    : ['*'];

  app.enableCors({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    maxAge: 86400, // 24 hours
  });

  // ============================================
  // GLOBAL PIPES (VALIDATION)
  // ============================================
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // ============================================
  // GLOBAL FILTERS & INTERCEPTORS
  // ============================================
  // Exception filter (must be registered before interceptors)
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Response and logging interceptors
  app.useGlobalInterceptors(
    new TimeoutInterceptor(loggerService),
    new LoggingInterceptor(loggerService),
    new ResponseInterceptor(),
  );

  // ============================================
  // SWAGGER / OPENAPI
  // ============================================
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Scraping API')
    .setDescription(
      'Price-tracking & web scraping API. Admin configures shops/categories, ' +
        'bots scrape products into PostgreSQL + Meilisearch, users search & compare.',
    )
    .setVersion(apiVersion)
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Paste access token from POST /api/v1/auth/login',
      },
      'JWT-auth',
    )
    .addTag('Health', 'Health, readiness and app info')
    .addTag('Auth', 'Register, login, refresh, logout')
    .addTag('Search', 'Product search and price compare (Meilisearch)')
    .addTag('Admin', 'Shop, category and scrape-target management (ADMIN only)')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'Scraping API Docs',
  });

  // ============================================
  // GRACEFUL SHUTDOWN
  // ============================================
  const gracefulShutdown = async (signal: string) => {
    loggerService.warn(
      `${signal} received. Starting graceful shutdown...`,
      'Bootstrap',
    );

    try {
      await app.close();
      loggerService.log(
        'Application closed gracefully',
        'Bootstrap',
      );
      process.exit(0);
    } catch (error) {
      loggerService.error(
        'Error during graceful shutdown',
        error instanceof Error ? error.stack : String(error),
        'Bootstrap',
      );
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    loggerService.error(
      'Uncaught Exception',
      error instanceof Error ? error.stack : String(error),
      'Bootstrap',
    );
    process.exit(1);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason) => {
    loggerService.error(
      'Unhandled Rejection',
      reason instanceof Error ? reason.stack : String(reason),
      'Bootstrap',
    );
  });

  // ============================================
  // START APPLICATION
  // ============================================
  try {
    await app.listen(port);

    const appUrl = await app.getUrl();
    loggerService.log(
      `========================================`,
      'Bootstrap',
    );
    loggerService.log(
      `Application is running in ${nodeEnv} mode`,
      'Bootstrap',
    );
    loggerService.log(
      `Server running at: ${appUrl}`,
      'Bootstrap',
    );
    loggerService.log(
      `API Prefix: /api`,
      'Bootstrap',
    );
    loggerService.log(
      `Swagger Docs: ${appUrl}/api/docs`,
      'Bootstrap',
    );
    loggerService.log(
      `API Version: ${apiVersion}`,
      'Bootstrap',
    );
    loggerService.log(
      `========================================`,
      'Bootstrap',
    );
  } catch (error) {
    loggerService.error(
      'Failed to start application',
      error instanceof Error ? error.stack : String(error),
      'Bootstrap',
    );
    process.exit(1);
  }
}

bootstrap();
