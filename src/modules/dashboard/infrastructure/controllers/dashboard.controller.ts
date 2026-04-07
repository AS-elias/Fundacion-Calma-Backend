import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { AdminGuard } from '../../../auth/infrastructure/guards/admin.guard';
import { DashboardService } from '../../dashboard.service';
import { UsuarioActual } from '../../../auth/infrastructure/decorators/current-user.decorator';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('admin')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getAdminDashboard() {
    return this.dashboardService.getAdminStats();
  }

  @Get('user')
  @UseGuards(JwtAuthGuard)
  async getUserDashboard(@UsuarioActual() usuario: { id: number }) {
    return this.dashboardService.getUserStats(usuario.id);
  }
}
