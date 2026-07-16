import { registerAs } from '@nestjs/config';
import { validateBoolean } from './validators';

export interface DatabaseConfiguration {
  url: string;
  ssl: boolean;
  sslRejectUnauthorized: boolean;
  logging: boolean | string[];
  synchronize: boolean;
  dropSchema: boolean;
  migrationsRun: boolean;
  maxConnections: number;
  minConnections: number;
  connectionTimeoutInMilliseconds: number;
  idleTimeoutInMilliseconds: number;
  retryAttempts: number;
  retryDelay: number;
}

export default registerAs('database', (): DatabaseConfiguration => {
  const isDevelopment = (process.env.NODE_ENV || 'development') === 'development';
  const isProduction = (process.env.NODE_ENV || 'development') === 'production';

  // Validate required DATABASE_URL
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL environment variable is required. ' +
        'Format: postgresql://user:password@host:port/database',
    );
  }

  // Parse logging configuration
  const loggingEnv = process.env.DATABASE_LOGGING || (isDevelopment ? 'query,error' : 'error');
  const loggingArray = loggingEnv
    .split(',')
    .map((log) => log.trim())
    .filter((log) => log.length > 0);

  const validLoggingOptions = ['query', 'error', 'schema', 'migration', 'info', 'log', 'warn'];
  const logging: string[] = loggingArray.every((log) => validLoggingOptions.includes(log))
    ? loggingArray
    : ['error'];

  const config: DatabaseConfiguration = {
    url: databaseUrl,
    ssl: validateBoolean(process.env.DATABASE_SSL, isProduction),
    sslRejectUnauthorized: validateBoolean(
      process.env.DATABASE_SSL_REJECT_UNAUTHORIZED,
      isProduction,
    ),
    logging: logging.length > 0 ? logging : false,
    synchronize: validateBoolean(process.env.DATABASE_SYNCHRONIZE, isDevelopment && !isProduction),
    dropSchema: validateBoolean(process.env.DATABASE_DROP_SCHEMA, false),
    migrationsRun: validateBoolean(process.env.DATABASE_MIGRATIONS_RUN, true),
    maxConnections: parseInt(process.env.DATABASE_MAX_CONNECTIONS || '20', 10),
    minConnections: parseInt(process.env.DATABASE_MIN_CONNECTIONS || '2', 10),
    connectionTimeoutInMilliseconds: parseInt(
      process.env.DATABASE_CONNECTION_TIMEOUT_MS || '30000',
      10,
    ),
    idleTimeoutInMilliseconds: parseInt(
      process.env.DATABASE_IDLE_TIMEOUT_MS || '30000',
      10,
    ),
    retryAttempts: parseInt(process.env.DATABASE_RETRY_ATTEMPTS || '3', 10),
    retryDelay: parseInt(process.env.DATABASE_RETRY_DELAY_MS || '3000', 10),
  };

  // Validation for production
  if (isProduction) {
    if (!config.ssl) {
      console.warn(
        'Warning: DATABASE_SSL is disabled in production. Consider enabling SSL for security.',
      );
    }
    if (config.synchronize) {
      throw new Error(
        'DATABASE_SYNCHRONIZE must be false in production to prevent schema changes.',
      );
    }
  }

  // Validate connection pool settings
  if (config.minConnections > config.maxConnections) {
    throw new Error(
      `DATABASE_MIN_CONNECTIONS (${config.minConnections}) cannot be greater than ` +
        `DATABASE_MAX_CONNECTIONS (${config.maxConnections})`,
    );
  }

  return config;
});
