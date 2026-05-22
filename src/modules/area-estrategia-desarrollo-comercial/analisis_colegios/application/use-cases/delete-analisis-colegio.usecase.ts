import { Injectable } from '@nestjs/common';
import { AnalisisColegioRepository } from '../../domain/repositories/analisis-colegio.repository';

import { DashboardGateway } from '../../../../websockets/gateways/dashboard.gateway';

@Injectable()
export class DeleteAnalisisColegioUseCase {
  constructor(
    private readonly repository: AnalisisColegioRepository,
    private readonly dashboardGateway: DashboardGateway,
  ) {}

  async execute(id: number) {
    await this.repository.delete(id);
    this.dashboardGateway.emitDashboardUpdated('analisis_colegio');
    return { message: 'Colegio eliminado exitosamente.' };
  }
}
