import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { DatabaseModule } from '../../database/database.module';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

/**
 * Auth module.
 *
 * Registers the JWT access-token strategy and wires two global guards:
 *  - JwtAuthGuard  → every route requires a valid token unless marked @Public()
 *  - RolesGuard    → routes marked @Roles(...) require a matching role
 *
 * Token secrets/expiries are passed per-sign from ConfigService, so JwtModule
 * is registered without static options.
 */
@Module({
  imports: [DatabaseModule, PassportModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
  exports: [AuthService],
})
export class AuthModule {}
