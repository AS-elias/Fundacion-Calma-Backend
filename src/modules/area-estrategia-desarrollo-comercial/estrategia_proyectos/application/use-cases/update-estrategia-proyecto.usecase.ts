import { Injectable } from '@nestjs/common';
import { UpdateEstrategiaProyectoDto } from '../dto/update-estrategia-proyecto.dto';
import { EstrategiaProyectoRepository } from '../../domain/repositories/estrategia-proyecto.repository';

import { DashboardGateway } from '../../../../websockets/gateways/dashboard.gateway';

@Injectable()
export class UpdateEstrategiaProyectoUseCase {
  constructor(
    private readonly repository: EstrategiaProyectoRepository,
    private readonly dashboardGateway: DashboardGateway,
  ) {}

  async execute(id: number, dto: UpdateEstrategiaProyectoDto) {
    const updated = await this.repository.update(id, dto);
    this.dashboardGateway.emitDashboardUpdated('estrategia_proyecto');
    return updated;
  }
}
