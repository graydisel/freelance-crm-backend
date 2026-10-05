import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';
import { Permission } from '../roles/enums/permission.enum';
import { PermissionsGuard } from '../auth/guards/permissions.guard';

@Controller('dashboard')
@UseGuards(PermissionsGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) { }

  @Get('stats')
  @RequirePermissions(Permission.ANALYTICS_READ)
  getStats() {
    return this.dashboardService.getDashboardStats();
  }
}
