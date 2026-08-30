import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UserProfilesService } from './user-profiles.service';
import { AuthGuard } from '@nestjs/passport';
import type { RequestWithUser } from './interfaces/request.interface';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';

@Controller('user-profiles')
@UseGuards(AuthGuard('jwt'))
export class UserProfilesController {
  constructor(private readonly userProfilesService: UserProfilesService) {}

  @Get('me')
  getProfile(@Request() req: RequestWithUser) {
    return this.userProfilesService.getProfileByUserId(req.user.sub);
  }

  @Patch('me')
  updateProfile(
    @Request() req: RequestWithUser,
    @Body() dto: UpdateUserProfileDto,
  ) {
    return this.userProfilesService.updateProfile(req.user.sub, dto);
  }
}
