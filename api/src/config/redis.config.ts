import { registerAs } from '@nestjs/config';
import { validateString, validatePort, validatePositiveInt } from './validators';

export interface RedisConfiguration {
  host: string;
  port: number;
  password?: string;
  db: number;
  username?: string;
  family: 4 | 6;
  connectTimeout: number;
  retryStrategy: (times: number) => number;
  enableReadyCheck: boolean;
  enableOfflineQueue: boolean;
  maxRetriesPerRequest: number | null;
  cluster?: {
    enabled: boolean;
    nodes?: string[];
  };
}

export default registerAs('redis', (): RedisConfiguration => {
  const host = validateString(process.env.REDIS_HOST, 'localhost');
  const port = validatePort(process.env.REDIS_PORT, 6379);
  const password = process.env.REDIS_PASSWORD;
  const db = validatePositiveInt(process.env.REDIS_DB, 0);
  const username = process.env.REDIS_USERNAME;
  const family = (parseInt(process.env.REDIS_FAMILY || '4', 10) === 6 ? 6 : 4) as 4 | 6;

  const connectTimeout = parseInt(process.env.REDIS_CONNECT_TIMEOUT || '10000', 10);
  const maxRetries = parseInt(process.env.REDIS_MAX_RETRIES || '10', 10);
  const retryDelay = parseInt(process.env.REDIS_RETRY_DELAY || '100', 10);
  const enableCluster = process.env.REDIS_CLUSTER_ENABLED === 'true';
  const clusterNodes = process.env.REDIS_CLUSTER_NODES?.split(',').map((n) => n.trim());

  // Retry strategy for connection failures
  const retryStrategy = (times: number): number => {
    const delay = Math.min(times * retryDelay, 30000); // Max 30s delay
    if (times > maxRetries) {
      throw new Error('Max Redis connection retries exceeded');
    }
    return delay;
  };

  const config: RedisConfiguration = {
    host,
    port,
    password: password && password.length > 0 ? password : undefined,
    db: Math.min(db, 15), // Redis has 16 databases (0-15)
    username: username && username.length > 0 ? username : undefined,
    family,
    connectTimeout,
    retryStrategy,
    enableReadyCheck: process.env.REDIS_ENABLE_READY_CHECK !== 'false',
    enableOfflineQueue: process.env.REDIS_ENABLE_OFFLINE_QUEUE !== 'false',
    maxRetriesPerRequest: null, // null = infinite retries for blocking commands
  };

  if (enableCluster && clusterNodes && clusterNodes.length > 0) {
    config.cluster = {
      enabled: true,
      nodes: clusterNodes,
    };
  }

  // Validation
  if (db > 15) {
    throw new Error(`Invalid Redis DB number: ${db}. Must be between 0 and 15.`);
  }

  if (process.env.NODE_ENV === 'production') {
    if (!password || password.length === 0) {
      console.warn('Warning: REDIS_PASSWORD is not set in production. Use a strong password.');
    }
    if (host === 'localhost' || host === '127.0.0.1') {
      throw new Error(
        'REDIS_HOST cannot be localhost in production. Use a remote Redis server.',
      );
    }
  }

  return config;
});
