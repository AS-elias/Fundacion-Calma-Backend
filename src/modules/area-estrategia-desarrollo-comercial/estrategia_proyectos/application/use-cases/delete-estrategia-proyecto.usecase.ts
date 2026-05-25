import { Injectable } from '@nestjs/common';
import { EstrategiaProyectoRepository } from '../../domain/repositories/estrategia-proyecto.repository';

import { DashboardGateway } from '../../../../websockets/gateways/dashboard.gateway';

@Injectable()
export class DeleteEstrategiaProyectoUseCase {
  constructor(
    private readonly repository: EstrategiaProyectoRepository,
    private readonly dashboardGateway: DashboardGateway,
  ) {}

  async execute(id: number) {
    await this.repository.delete(id);
    this.dashboardGateway.emitDashboardUpdated('estrategia_proyecto');
    return { message: 'Proyecto eliminado exitosamente.' };
  }
}
