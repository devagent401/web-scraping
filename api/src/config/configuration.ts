export interface AppConfig {
  name: string;
  port: number;
  host: string;
  nodeEnv: string;
}

export interface DatabaseConfig {
  url: string;
  logging: boolean;
}

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
}

export interface JwtConfig {
  secret: string;
  expiresIn: string;
  refreshSecret: string;
  refreshExpiresIn: string;
}

export interface MeilisearchConfig {
  host: string;
  apiKey: string;
}

export default () => ({
  app: {
    name: process.env.APP_NAME || 'Scraping API',
    port: parseInt(process.env.APP_PORT || '5000', 10),
    host: process.env.APP_HOST || '0.0.0.0',
    nodeEnv: process.env.NODE_ENV || 'development',
  } as AppConfig,

  database: {
    url:
      process.env.DATABASE_URL ||
      'postgresql://user:password@localhost:5432/scraping_db',
    logging: process.env.DATABASE_LOG === 'true',
  } as DatabaseConfig,

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0', 10),
  } as RedisConfig,

  jwt: {
    secret: process.env.JWT_SECRET || 'secret-key-change-this',
    expiresIn: process.env.JWT_EXPIRATION || '7d',
    refreshSecret:
      process.env.REFRESH_TOKEN_SECRET || 'refresh-secret-key-change-this',
    refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRATION || '30d',
  } as JwtConfig,

  meilisearch: {
    host: process.env.MEILISEARCH_HOST || 'http://localhost:7700',
    apiKey: process.env.MEILISEARCH_API_KEY || 'masterKey',
  } as MeilisearchConfig,

  scraper: {
    timeout: parseInt(process.env.SCRAPER_TIMEOUT || '30000', 10),
    retryCount: parseInt(process.env.SCRAPER_RETRY_COUNT || '3', 10),
    retryDelay: parseInt(process.env.SCRAPER_RETRY_DELAY || '1000', 10),
    userAgent:
      process.env.SCRAPER_USER_AGENT ||
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  },

  logging: {
    level: process.env.LOG_LEVEL || 'debug',
    format: process.env.LOG_FORMAT || 'json',
  },

  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
  },
});
