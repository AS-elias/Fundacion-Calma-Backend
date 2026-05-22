import { Injectable } from '@nestjs/common';
import { AnalisisTareaRepository } from '../../domain/repositories/analisis-tarea.repository';

import { DashboardGateway } from '../../../../websockets/gateways/dashboard.gateway';

@Injectable()
export class DeleteAnalisisTareaUseCase {
  constructor(
    private readonly repository: AnalisisTareaRepository,
    private readonly dashboardGateway: DashboardGateway,
  ) {}

  async execute(id: number) {
    await this.repository.delete(id);
    this.dashboardGateway.emitDashboardUpdated('analisis_tarea');
    return { message: 'Tarea eliminada exitosamente.' };
  }
}
