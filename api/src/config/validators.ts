/**
 * Validates and returns a string environment variable
 * @param value - The environment variable value
 * @param defaultValue - Default value if not provided or empty
 * @returns The validated string value
 */
export function validateString(value: string | undefined, defaultValue: string): string {
  return (value && value.trim()) || defaultValue;
}

/**
 * Validates and returns a port number
 * @param value - The environment variable value
 * @param defaultValue - Default port number
 * @returns The validated port number
 * @throws Error if port is invalid
 */
export function validatePort(value: string | undefined, defaultValue: number): number {
  const port = parseInt(value || defaultValue.toString(), 10);
  if (isNaN(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid port: ${value}. Port must be between 1 and 65535.`);
  }
  return port;
}

/**
 * Validates and returns a positive integer
 * @param value - The environment variable value
 * @param defaultValue - Default value if not provided
 * @returns The validated integer
 * @throws Error if value is not a valid positive integer
 */
export function validatePositiveInt(value: string | undefined, defaultValue: number): number {
  const num = parseInt(value || defaultValue.toString(), 10);
  if (isNaN(num) || num < 0) {
    throw new Error(`Invalid positive integer: ${value}. Must be >= 0.`);
  }
  return num;
}

/**
 * Validates and returns a URL
 * @param value - The environment variable value
 * @param defaultValue - Default URL if not provided
 * @returns The validated URL
 * @throws Error if URL is invalid
 */
export function validateUrl(value: string | undefined, defaultValue: string): string {
  const url = validateString(value, defaultValue);
  try {
    new URL(url);
    return url;
  } catch (error) {
    throw new Error(`Invalid URL: ${url}`);
  }
}

/**
 * Validates and returns a required string (cannot be empty)
 * @param value - The environment variable value
 * @param fieldName - The name of the field (for error messages)
 * @returns The validated string value
 * @throws Error if value is not provided or empty
 */
export function validateRequiredString(value: string | undefined, fieldName: string): string {
  if (!value || !value.trim()) {
    throw new Error(`Required environment variable not set: ${fieldName}`);
  }
  return value.trim();
}

/**
 * Validates and returns a boolean value
 * @param value - The environment variable value
 * @param defaultValue - Default boolean value
 * @returns The validated boolean value
 */
export function validateBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined || value === '') {
    return defaultValue;
  }
  return value.toLowerCase() === 'true' || value === '1';
}

/**
 * Validates and returns a comma-separated array of strings
 * @param value - The environment variable value
 * @param defaultArray - Default array if not provided
 * @returns Array of trimmed strings
 */
export function validateStringArray(
  value: string | undefined,
  defaultArray: string[] = [],
): string[] {
  if (!value) {
    return defaultArray;
  }
  return value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

/**
 * Validates JWT-like expiration strings (e.g., '7d', '24h', '3600s')
 * @param value - The expiration string
 * @param defaultValue - Default expiration if not provided
 * @returns The validated expiration string
 */
export function validateExpiration(value: string | undefined, defaultValue: string): string {
  const exp = validateString(value, defaultValue);
  const validPattern = /^(\d+)([smhdwy])$/;
  if (!validPattern.test(exp)) {
    throw new Error(
      `Invalid expiration format: ${exp}. Use format like '7d', '24h', '3600s', etc.`,
    );
  }
  return exp;
}
