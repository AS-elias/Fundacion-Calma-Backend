import { Injectable } from '@nestjs/common';
import { EstrategiaProyectoEnlaceFilters } from '../../domain/interfaces/estrategia-proyecto-enlace-filters.interface';
import { EstrategiaProyectoEnlaceRepository } from '../../domain/repositories/estrategia-proyecto-enlace.repository';

@Injectable()
export class GetEstrategiaProyectoEnlacesUseCase {
  constructor(
    private readonly repository: EstrategiaProyectoEnlaceRepository,
  ) {}

  execute(filters: EstrategiaProyectoEnlaceFilters) {
    return this.repository.findAll(filters);
  }
}
