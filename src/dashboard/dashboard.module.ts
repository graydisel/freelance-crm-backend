import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientProfileEntity } from '../client-profiles/client-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ClientProfileEntity])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
