import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TerminusModule } from '@nestjs/terminus';

import configuration from './config/configuration';
import { redisConfig, meilisearchConfig } from './config';

import { DatabaseModule } from './database/database.module';
import { LoggerModule } from './common/logger/logger.module';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';

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

import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [
        `.env.${process.env.NODE_ENV}`,
        '.env',
        '.env.development',
      ],
      // configuration.ts owns jwt/app/db; registerAs for redis/meilisearch namespaces
      load: [configuration, redisConfig, meilisearchConfig],
      isGlobal: true,
      cache: true,
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),

    ScheduleModule.forRoot(),

    LoggerModule,
    DatabaseModule,
    TerminusModule,

    AuthModule,
    ProductsModule,
    SearchModule,
    ShopsModule,
    ProvidersModule,
    CacheModule,
    QueueModule,
    JobsModule,
    NotificationsModule,
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
