import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';

import {
  AuthUser,
  AuthenticatedUser,
  Public,
} from '../../common/decorators';

import { AuthService } from './auth.service';
import { LoginDto, RefreshTokenDto, RegisterDto } from './dto/auth.dto';

@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto) {
    return this.auth.refresh(dto.refreshToken);
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  logout(@AuthUser() user: AuthenticatedUser) {
    return this.auth.logout(user.id);
  }

  @Get('me')
  me(@AuthUser() user: AuthenticatedUser) {
    return this.auth.me(user.id);
  }
}
