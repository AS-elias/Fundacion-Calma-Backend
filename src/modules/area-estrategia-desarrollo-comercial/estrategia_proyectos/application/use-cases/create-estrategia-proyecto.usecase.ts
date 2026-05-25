import { Injectable } from '@nestjs/common';
import { CreateEstrategiaProyectoDto } from '../dto/create-estrategia-proyecto.dto';
import { EstrategiaProyectoRepository } from '../../domain/repositories/estrategia-proyecto.repository';

import { DashboardGateway } from '../../../../websockets/gateways/dashboard.gateway';

@Injectable()
export class CreateEstrategiaProyectoUseCase {
  constructor(
    private readonly repository: EstrategiaProyectoRepository,
    private readonly dashboardGateway: DashboardGateway,
  ) {}

  async execute(dto: CreateEstrategiaProyectoDto) {
    const created = await this.repository.create(dto);
    this.dashboardGateway.emitDashboardUpdated('estrategia_proyecto');
    return created;
  }
}
