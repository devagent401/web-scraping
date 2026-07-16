import { registerAs } from '@nestjs/config';
import { validateRequiredString, validateExpiration } from './validators';

export interface JwtConfiguration {
  accessToken: {
    secret: string;
    expiresIn: string;
    algorithm: string;
  };
  refreshToken: {
    secret: string;
    expiresIn: string;
    algorithm: string;
  };
  issuer: string;
  audience: string;
}

export default registerAs('jwt', (): JwtConfiguration => {
  const isProduction = process.env.NODE_ENV === 'production';

  // Validate required JWT secrets
  let accessSecret = process.env.JWT_SECRET;
  let refreshSecret = process.env.REFRESH_TOKEN_SECRET;

  if (isProduction) {
    accessSecret = validateRequiredString(accessSecret, 'JWT_SECRET');
    refreshSecret = validateRequiredString(refreshSecret, 'REFRESH_TOKEN_SECRET');

    // Check for default values in production
    if (accessSecret === 'secret-key-change-this' ||
        accessSecret === 'your-secret-key-change-this-in-production') {
      throw new Error(
        'JWT_SECRET is using a default value in production. ' +
          'Please set a strong, unique secret key.',
      );
    }

    if (refreshSecret === 'refresh-secret-key-change-this' ||
        refreshSecret === 'your-refresh-secret-key-change-this-in-production') {
      throw new Error(
        'REFRESH_TOKEN_SECRET is using a default value in production. ' +
          'Please set a strong, unique secret key.',
      );
    }

    // Ensure secrets are sufficiently long
    if (accessSecret.length < 32) {
      throw new Error(
        'JWT_SECRET must be at least 32 characters long in production.',
      );
    }

    if (refreshSecret.length < 32) {
      throw new Error(
        'REFRESH_TOKEN_SECRET must be at least 32 characters long in production.',
      );
    }
  } else {
    // Development defaults
    accessSecret = accessSecret || 'secret-key-change-this';
    refreshSecret = refreshSecret || 'refresh-secret-key-change-this';
  }

  const config: JwtConfiguration = {
    accessToken: {
      secret: accessSecret,
      expiresIn: validateExpiration(process.env.JWT_EXPIRATION, '7d'),
      algorithm: process.env.JWT_ALGORITHM || 'HS256',
    },
    refreshToken: {
      secret: refreshSecret,
      expiresIn: validateExpiration(process.env.REFRESH_TOKEN_EXPIRATION, '30d'),
      algorithm: process.env.REFRESH_TOKEN_ALGORITHM || 'HS256',
    },
    issuer: process.env.JWT_ISSUER || 'scraping-api',
    audience: process.env.JWT_AUDIENCE || 'scraping-api-users',
  };

  // Validate that secrets are different
  if (config.accessToken.secret === config.refreshToken.secret) {
    console.warn(
      'Warning: JWT_SECRET and REFRESH_TOKEN_SECRET should be different. ' +
        'They should not be the same value.',
    );
  }

  // Validate algorithms
  const validAlgorithms = ['HS256', 'HS384', 'HS512', 'RS256', 'RS384', 'RS512'];
  if (!validAlgorithms.includes(config.accessToken.algorithm)) {
    throw new Error(
      `Invalid JWT algorithm: ${config.accessToken.algorithm}. ` +
        `Supported: ${validAlgorithms.join(', ')}`,
    );
  }

  if (!validAlgorithms.includes(config.refreshToken.algorithm)) {
    throw new Error(
      `Invalid Refresh Token algorithm: ${config.refreshToken.algorithm}. ` +
        `Supported: ${validAlgorithms.join(', ')}`,
    );
  }

  return config;
});
