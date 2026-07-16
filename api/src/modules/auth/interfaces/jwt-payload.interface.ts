import { UserRole } from '@prisma/client';

/**
 * Decoded JWT payload. Shared by both the access and refresh tokens.
 * `tokenVersion` is compared against the user record on refresh so a
 * logout (which bumps the version) invalidates every previously issued token.
 */
export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  tokenVersion: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
