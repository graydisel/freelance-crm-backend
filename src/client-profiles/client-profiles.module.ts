import { Module } from '@nestjs/common';
import { ClientProfilesService } from './client-profiles.service';
import { ClientProfilesController } from './client-profiles.controller';

@Module({
  providers: [ClientProfilesService],
  controllers: [ClientProfilesController]
})
export class ClientProfilesModule {}
