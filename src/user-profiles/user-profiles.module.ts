import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserProfileEntity } from './user-profiles.entity';
import { UserProfilesService } from './user-profiles.service';
import { UserProfilesController } from './user-profiles.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserProfileEntity])],
  providers: [UserProfilesService],
  controllers: [UserProfilesController],
  exports: [UserProfilesService],
})
export class UserProfilesModule {}
