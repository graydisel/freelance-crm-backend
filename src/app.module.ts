import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectEntity } from './projects/project.entity';
import { TaskEntity } from './tasks/task.entity';
import { ProjectsModule } from './projects/projects.module';
import * as process from 'node:process';
import { ConfigModule } from '@nestjs/config';
import { TasksModule } from './tasks/tasks.module';
import {UserEntity} from "./users/user.entity";
import {ClientProfileEntity} from "./client-profiles/client-profile.entity";
import {RoleEntity} from "./roles/role.entity";
import { ClientProfilesModule } from './client-profiles/client-profiles.module';
import { RolesModule } from './roles/roles.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.POSTGRES_BASE,
      entities: [ProjectEntity, TaskEntity, UserEntity, ClientProfileEntity, RoleEntity],
      synchronize: false,
      migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
      ssl: true,
    }),
    ProjectsModule,
    TasksModule,
    ClientProfilesModule,
    RolesModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
