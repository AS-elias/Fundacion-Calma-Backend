import { Injectable } from '@nestjs/common';
import { UpdateAnalisisColegioDto } from '../dto/update-analisis-colegio.dto';
import { AnalisisColegioRepository } from '../../domain/repositories/analisis-colegio.repository';

import { DashboardGateway } from '../../../../websockets/gateways/dashboard.gateway';

@Injectable()
export class UpdateAnalisisColegioUseCase {
  constructor(
    private readonly repository: AnalisisColegioRepository,
    private readonly dashboardGateway: DashboardGateway,
  ) {}

  async execute(id: number, dto: UpdateAnalisisColegioDto) {
    const updated = await this.repository.update(id, dto);
    this.dashboardGateway.emitDashboardUpdated('analisis_colegio');
    return updated;
  }
}
