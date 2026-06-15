import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectEntity } from './project.entity';
import {ClientProfilesModule} from "../client-profiles/client-profiles.module";
import {UsersModule} from "../users/users.module";

@Module({
  imports: [
      TypeOrmModule.forFeature([ProjectEntity]),
      ClientProfilesModule,
      UsersModule,
  ],
  exports: [ProjectsService],
  providers: [ProjectsService],
  controllers: [ProjectsController],
})
export class ProjectsModule {}
