import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProjectsModule } from './projects/projects.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TasksModule } from './tasks/tasks.module';

import { ClientProfilesModule } from './client-profiles/client-profiles.module';
import { RolesModule } from './roles/roles.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { RouteTimerInterceptor } from './common/interceptors/route-timer.interceptor';
import { UserProfilesModule } from './user-profiles/user-profiles.module';

import { HealthModule } from './health/health.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

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

        if (dbUrl) {
          return {
            type: 'postgres',
            url: dbUrl,
            autoLoadEntities: true,
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
          autoLoadEntities: true,
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
    HealthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: RouteTimerInterceptor,
    },
  ],
})
export class AppModule {}
