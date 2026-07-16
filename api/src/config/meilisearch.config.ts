import { registerAs } from '@nestjs/config';
import { validateUrl, validateString } from './validators';

export interface MeilisearchConfiguration {
  host: string;
  apiKey: string;
  masterKey?: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  indices: {
    prefix: string;
    batchSize: number;
  };
  settings: {
    rankingRules: string[];
    searchableAttributes: string[];
    displayedAttributes: string[];
    filterableAttributes: string[];
    sortableAttributes: string[];
    stopWords: string[];
    synonyms: Record<string, string[]>;
    distinctAttribute?: string;
    typoTolerance: {
      enabled: boolean;
      minWordSizeForTypos: number;
      disableOnWords: string[];
      disableOnAttributes: string[];
    };
  };
}

export default registerAs('meilisearch', (): MeilisearchConfiguration => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Validate host URL
  const host = validateUrl(
    process.env.MEILISEARCH_HOST,
    'http://localhost:7700',
  );

  // Validate API key
  let apiKey = process.env.MEILISEARCH_API_KEY;
  if (!apiKey || apiKey.trim().length === 0) {
    if (isProduction) {
      throw new Error(
        'MEILISEARCH_API_KEY is required in production. ' +
        'Generate a new API key in Meilisearch dashboard.',
      );
    }
    apiKey = 'masterKey'; // Development default
  }

  if (isProduction && apiKey === 'masterKey') {
    throw new Error(
      'MEILISEARCH_API_KEY cannot be "masterKey" in production. ' +
      'Use a specific API key with proper permissions.',
    );
  }

  const timeout = parseInt(process.env.MEILISEARCH_TIMEOUT || '30000', 10);
  const retryAttempts = parseInt(process.env.MEILISEARCH_RETRY_ATTEMPTS || '3', 10);
  const retryDelay = parseInt(process.env.MEILISEARCH_RETRY_DELAY || '1000', 10);
  const indicePrefix = validateString(process.env.MEILISEARCH_INDEX_PREFIX, 'app_');
  const batchSize = parseInt(process.env.MEILISEARCH_BATCH_SIZE || '100', 10);

  const config: MeilisearchConfiguration = {
    host,
    apiKey,
    masterKey: process.env.MEILISEARCH_MASTER_KEY,
    timeout,
    retryAttempts,
    retryDelay,
    indices: {
      prefix: indicePrefix,
      batchSize: Math.max(1, Math.min(batchSize, 1000)), // Between 1-1000
    },
    settings: {
      rankingRules: [
        'words',
        'typo',
        'proximity',
        'attribute',
        'sort',
        'exactness',
      ],
      searchableAttributes: [],
      displayedAttributes: [],
      filterableAttributes: [],
      sortableAttributes: [],
      stopWords: [
        'the',
        'a',
        'an',
        'and',
        'or',
        'is',
        'of',
        'to',
        'in',
        'for',
        'on',
        'at',
        'by',
        'with',
      ],
      synonyms: {},
      typoTolerance: {
        enabled: true,
        minWordSizeForTypos: 5,
        disableOnWords: [],
        disableOnAttributes: [],
      },
    },
  };

  // Validation for production
  if (isProduction) {
    if (host.includes('localhost') || host.includes('127.0.0.1')) {
      throw new Error(
        'MEILISEARCH_HOST cannot be localhost in production. ' +
        'Use a remote Meilisearch server.',
      );
    }
  }

  // Validation for development
  if (isDevelopment) {
    if (timeout < 5000) {
      console.warn(
        'MEILISEARCH_TIMEOUT is very low. Consider increasing it for development.',
      );
    }
  }

  return config;
});
