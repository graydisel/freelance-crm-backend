import { Module } from '@nestjs/common';
import { ClientProfilesService } from './client-profiles.service';
import { ClientProfilesController } from './client-profiles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientProfileEntity } from './client-profile.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([ClientProfileEntity]), UsersModule],
  exports: [ClientProfilesService],
  providers: [ClientProfilesService],
  controllers: [ClientProfilesController],
})
export class ClientProfilesModule { }
