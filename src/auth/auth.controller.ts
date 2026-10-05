import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { type RequestWithUser } from './interfaces/request-with-user.interface';
import { Public } from 'src/common/decorators/public.decorator';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from './decorators/current-user.decorator';
import type { AuthenticatedUser } from './interfaces/request-with-user.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Req() req: RequestWithUser) {
    return this.authService.login(req.user);
  }

  @Get('profile')
  getProfile(@CurrentUser() user: AuthenticatedUser) {
    return user;
  }
}
