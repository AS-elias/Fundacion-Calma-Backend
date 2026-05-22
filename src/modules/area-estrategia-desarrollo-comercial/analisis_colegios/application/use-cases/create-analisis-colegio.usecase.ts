import { Injectable } from '@nestjs/common';
import { CreateAnalisisColegioDto } from '../dto/create-analisis-colegio.dto';
import { AnalisisColegioRepository } from '../../domain/repositories/analisis-colegio.repository';

import { DashboardGateway } from '../../../../websockets/gateways/dashboard.gateway';

@Injectable()
export class CreateAnalisisColegioUseCase {
  constructor(
    private readonly repository: AnalisisColegioRepository,
    private readonly dashboardGateway: DashboardGateway,
  ) {}

  async execute(dto: CreateAnalisisColegioDto) {
    const created = await this.repository.create(dto);
    this.dashboardGateway.emitDashboardUpdated('analisis_colegio');
    return created;
  }
}
