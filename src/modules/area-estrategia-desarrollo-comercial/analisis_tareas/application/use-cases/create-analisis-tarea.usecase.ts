import { Injectable } from '@nestjs/common';
import { CreateAnalisisTareaDto } from '../dto/create-analisis-tarea.dto';
import { AnalisisTareaRepository } from '../../domain/repositories/analisis-tarea.repository';

import { DashboardGateway } from '../../../../websockets/gateways/dashboard.gateway';

@Injectable()
export class CreateAnalisisTareaUseCase {
  constructor(
    private readonly repository: AnalisisTareaRepository,
    private readonly dashboardGateway: DashboardGateway,
  ) {}

  async execute(dto: CreateAnalisisTareaDto) {
    const created = await this.repository.create(dto);
    this.dashboardGateway.emitDashboardUpdated('analisis_tarea');
    return created;
  }
}
