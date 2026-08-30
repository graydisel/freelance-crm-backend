import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectEntity } from './projects/project.entity';
import { TaskEntity } from './tasks/task.entity';
import { ProjectsModule } from './projects/projects.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TasksModule } from './tasks/tasks.module';
import { UserEntity } from './users/user.entity';
import { ClientProfileEntity } from './client-profiles/client-profile.entity';
import { RoleEntity } from './roles/role.entity';
import { ClientProfilesModule } from './client-profiles/client-profiles.module';
import { RolesModule } from './roles/roles.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { RouteTimerInterceptor } from './interceptors/route-timer.interceptor';
import { UserProfilesModule } from './user-profiles/user-profiles.module';
import { UserProfileEntity } from './user-profiles/user-profiles.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbUrl = configService.get<string>('POSTGRES_BASE');
        const enableSsl = configService.get<string>('DB_SSL') === 'true';

        const commonEntities = [
          ProjectEntity,
          TaskEntity,
          UserEntity,
          ClientProfileEntity,
          RoleEntity,
          UserProfileEntity,
        ];

        if (dbUrl) {
          return {
            type: 'postgres',
            url: dbUrl,
            entities: commonEntities,
            synchronize: false,
            migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
            ssl: enableSsl ? { rejectUnauthorized: false } : false,
          };
        }

        return {
          type: 'postgres',
          host: configService.get<string>('DB_HOST', 'postgres_db'),
          port: configService.get<number>('DB_PORT', 5432),
          username: configService.get<string>('DB_USERNAME', 'postgres'),
          password: configService.get<string>(
            'DB_PASSWORD',
            'postgres_password',
          ),
          database: configService.get<string>('DB_DATABASE', 'crm_db'),
          entities: commonEntities,
          synchronize: true,
          migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
          ssl: false,
        };
      },
    }),
    ProjectsModule,
    TasksModule,
    ClientProfilesModule,
    RolesModule,
    UsersModule,
    AuthModule,
    DashboardModule,
    UserProfilesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: RouteTimerInterceptor,
    },
  ],
})
export class AppModule {}
