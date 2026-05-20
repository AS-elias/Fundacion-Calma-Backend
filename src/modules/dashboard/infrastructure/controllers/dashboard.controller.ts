import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { AdminGuard } from '../../../auth/infrastructure/guards/admin.guard';
import { DashboardService } from '../../dashboard.service';
import { UsuarioActual } from '../../../auth/infrastructure/decorators/current-user.decorator';
import { RolesFundacion } from '../../../auth/domain/enums/roles.enum';

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

  @Post('director-evaluation')
  @UseGuards(JwtAuthGuard)
  async createDirectorEvaluation(
    @UsuarioActual() usuario: { id: number; rol: string },
    @Body() body: any,
  ) {
    if (usuario.rol !== RolesFundacion.DIRECTOR) {
      throw new ForbiddenException('Solo el director puede crear su evaluación.');
    }

    const rating = Number(body.rating);
    const comentario = body.comentario ? String(body.comentario).trim() : undefined;

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new BadRequestException('rating debe ser un entero entre 1 y 5.');
    }

    return this.dashboardService.createDirectorEvaluation(usuario.id, rating, comentario);
  }

  @Get('director-evaluations')
  @UseGuards(JwtAuthGuard)
  async getDirectorEvaluations(@UsuarioActual() usuario: { id: number; rol: string }) {
    if (usuario.rol !== RolesFundacion.DIRECTOR) {
      throw new ForbiddenException('Solo el director puede ver sus evaluaciones.');
    }

    return this.dashboardService.getDirectorEvaluations(usuario.id);
  }

  @Get('debug')
  async getDebugDashboard() {
    if (process.env.NODE_ENV === 'production') {
      throw new ForbiddenException('Debug endpoint disabled in production.');
    }
    return this.dashboardService.getAdminStats();
  }
}
