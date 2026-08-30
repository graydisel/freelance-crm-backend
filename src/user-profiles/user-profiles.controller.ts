import { Controller, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { UserProfilesService } from './user-profiles.service';
import { AuthGuard } from '@nestjs/passport';
import type { RequestWithUser } from './interfaces/request.interface';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user-profiles')
@UseGuards(AuthGuard('jwt'))
export class UserProfilesController {
  constructor(private readonly userProfilesService: UserProfilesService) { }

  @Get('me')
  getProfile(@Request() req: RequestWithUser) {
    return this.userProfilesService.getProfileByUserId(req.user.sub);
  }

  @Patch('me')
  updateProfile(
    @Request() req: RequestWithUser,
    @Body() dto: UpdateUserDto,
  ) {
    return this.userProfilesService.updateProfile(req.user.sub, dto);
  }
}
