import { Controller, Get, Post, Req, UseGuards, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { type RequestWithUserEntity } from './interfaces/request-with-user.interface';
import { Public } from 'src/common/decorators/public.decorator';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from './decorators/current-user.decorator';
import type { AuthenticatedUser } from './interfaces/request-with-user.interface';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Req() req: RequestWithUserEntity) {
    this.logger.log(`POST /auth/login for user: ${req.user.email}`);
    return this.authService.login(req.user);
  }

  @Get('profile')
  getProfile(@CurrentUser() user: AuthenticatedUser) {
    this.logger.log(`GET /auth/profile for user: ${user.email}`);
    return user;
  }
}
