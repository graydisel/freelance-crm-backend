import { Controller, Get, UseGuards, Logger } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';
import { Permission } from '../roles/enums/permission.enum';
import { PermissionsGuard } from '../auth/guards/permissions.guard';

@Controller('dashboard')
@UseGuards(PermissionsGuard)
export class DashboardController {
  private readonly logger = new Logger(DashboardController.name);

  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @RequirePermissions(Permission.ANALYTICS_READ)
  getStats() {
    this.logger.log('GET /dashboard/stats requested');
    return this.dashboardService.getDashboardStats();
  }
}
