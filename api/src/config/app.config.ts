import { registerAs } from '@nestjs/config';
import { validateString, validatePort } from './validators';

export interface AppConfiguration {
  name: string;
  port: number;
  host: string;
  env: 'development' | 'staging' | 'production';
  isDevelopment: boolean;
  isProduction: boolean;
  isStaging: boolean;
  corsOrigins: string[];
  apiPrefix: string;
  globalPrefix: string;
  version: string;
  enableShutdownHooks: boolean;
  enableMetrics: boolean;
}

export default registerAs('app', (): AppConfiguration => {
  const nodeEnv = (process.env.NODE_ENV || 'development').toLowerCase() as
    | 'development'
    | 'staging'
    | 'production';

  const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
  const corsOrigins = corsOrigin.split(',').map((origin) => origin.trim());

  const config: AppConfiguration = {
    name: validateString(process.env.APP_NAME, 'Scraping API'),
    port: validatePort(process.env.APP_PORT, 5000),
    host: validateString(process.env.APP_HOST, '0.0.0.0'),
    env: nodeEnv,
    isDevelopment: nodeEnv === 'development',
    isProduction: nodeEnv === 'production',
    isStaging: nodeEnv === 'staging',
    corsOrigins,
    apiPrefix: validateString(process.env.API_PREFIX, 'api'),
    globalPrefix: validateString(process.env.GLOBAL_PREFIX, ''),
    version: validateString(process.env.APP_VERSION, '1.0.0'),
    enableShutdownHooks: process.env.ENABLE_SHUTDOWN_HOOKS !== 'false',
    enableMetrics: process.env.ENABLE_METRICS !== 'false',
  };

  // Validate production environment
  if (config.isProduction) {
    if (corsOrigins.includes('*')) {
      throw new Error(
        'CORS origin cannot be * in production. Please specify allowed origins.',
      );
    }
    if (config.host === '0.0.0.0') {
      console.warn(
        'Warning: APP_HOST is 0.0.0.0 in production. Consider using a specific IP address.',
      );
    }
  }

  return config;
});
