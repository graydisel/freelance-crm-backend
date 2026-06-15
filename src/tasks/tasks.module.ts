import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskEntity } from './task.entity';
import { ProjectEntity } from '../projects/project.entity';
import { ProjectsModule } from '../projects/projects.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TaskEntity]),
    ProjectsModule,
    UsersModule,
  ],
  providers: [TasksService],
  controllers: [TasksController],
})
export class TasksModule {}
