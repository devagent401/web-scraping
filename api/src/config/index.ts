/**
 * Configuration Module Exports
 *
 * This module exports all application configuration modules that are registered
 * with NestJS Config. These configurations are environment-aware and production-ready.
 *
 * Usage in app.module.ts:
 * import { ConfigModule } from '@nestjs/config';
 * import appConfig from './config/app.config';
 * import databaseConfig from './config/database.config';
 * import redisConfig from './config/redis.config';
 * import jwtConfig from './config/jwt.config';
 * import meilisearchConfig from './config/meilisearch.config';
 *
 * @Module({
 *   imports: [
 *     ConfigModule.forRoot({
 *       load: [appConfig, databaseConfig, redisConfig, jwtConfig, meilisearchConfig],
 *       isGlobal: true,
 *     }),
 *   ],
 * })
 * export class AppModule {}
 */

export { default as appConfig } from './app.config';
export type { AppConfiguration } from './app.config';

export { default as databaseConfig } from './database.config';
export type { DatabaseConfiguration } from './database.config';

export { default as redisConfig } from './redis.config';
export type { RedisConfiguration } from './redis.config';

export { default as jwtConfig } from './jwt.config';
export type { JwtConfiguration } from './jwt.config';

export { default as meilisearchConfig } from './meilisearch.config';
export type { MeilisearchConfiguration } from './meilisearch.config';

// Export validators for use in other modules
export * from './validators';
