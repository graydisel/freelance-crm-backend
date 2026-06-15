import { Module } from '@nestjs/common';
import { ClientProfilesService } from './client-profiles.service';
import { ClientProfilesController } from './client-profiles.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {ProjectEntity} from "../projects/project.entity";
import {ClientProfileEntity} from "./client-profile.entity";

@Module({
  imports: [TypeOrmModule.forFeature([ClientProfileEntity])],
  exports: [ClientProfilesService],
  providers: [ClientProfilesService],
  controllers: [ClientProfilesController]
})
export class ClientProfilesModule {}
