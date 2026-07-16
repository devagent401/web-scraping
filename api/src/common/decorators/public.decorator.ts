import { SetMetadata } from '@nestjs/common';

/**
 * Public Decorator
 *
 * Use this decorator to mark routes that do not require authentication.
 * This should be used in conjunction with an Authentication Guard that checks for this metadata.
 *
 * Example:
 * @Controller('auth')
 * export class AuthController {
 *   @Post('login')
 *   @Public()
 *   login(@Body() credentials: LoginDto) {
 *     return this.authService.login(credentials);
 *   }
 *
 *   @Post('register')
 *   @Public()
 *   register(@Body() userData: RegisterDto) {
 *     return this.authService.register(userData);
 *   }
 *
 *   @Get('profile')
 *   getProfile(@AuthUser() user: AuthenticatedUser) {
 *     return user;
 *   }
 * }
 *
 * In your auth.guard.ts:
 * @Injectable()
 * export class AuthGuard implements CanActivate {
 *   canActivate(context: ExecutionContext): boolean {
 *     const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
 *       context.getHandler(),
 *       context.getClass(),
 *     ]);
 *
 *     if (isPublic) {
 *       return true;
 *     }
 *
 *     // Perform authentication check
 *     const request = context.switchToHttp().getRequest();
 *     return !!request.user;
 *   }
 *
 *   constructor(private readonly reflector: Reflector) {}
 * }
 */
export const Public = () => SetMetadata('isPublic', true);

/**
 * Get Public Metadata
 *
 * Helper function to retrieve the public metadata from a request handler.
 * Useful in guards for checking if a route is public.
 *
 * Example:
 * const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
 *   context.getHandler(),
 *   context.getClass(),
 * ]);
 */
export const IS_PUBLIC_KEY = 'isPublic';
