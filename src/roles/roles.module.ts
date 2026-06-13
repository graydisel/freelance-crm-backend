import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import {TypeOrmModule} from "@nestjs/typeorm";
import {RoleEntity} from "./role.entity";

@Module({
  imports: [TypeOrmModule.forFeature([RoleEntity])],
  providers: [RolesService],
  exports: [RolesService],
})
export class RolesModule {}
