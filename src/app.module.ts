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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.POSTGRES_BASE,
      entities: [ProjectEntity, TaskEntity],
      synchronize: true,
      ssl: true,
    }),
    ProjectsModule,
    TasksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
