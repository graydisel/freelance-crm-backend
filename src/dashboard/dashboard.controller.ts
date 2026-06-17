import {Controller, Get, UseGuards} from '@nestjs/common';
import {DashboardService} from "./dashboard.service";
import {AuthGuard} from "@nestjs/passport";
import {RolesGuard} from "../auth/guards/roles.guard";
import {Roles} from "../auth/decorators/roles.decorator";

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @Roles('admin', 'manager')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  getStats() {
    return this.dashboardService.getDashboardStats();
  }
}
