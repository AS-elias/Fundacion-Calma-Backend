import { Injectable } from '@nestjs/common';
import { EstrategiaProyectoFilters } from '../../domain/interfaces/estrategia-proyecto-filters.interface';
import { EstrategiaProyectoRepository } from '../../domain/repositories/estrategia-proyecto.repository';

@Injectable()
export class GetEstrategiaProyectosUseCase {
  constructor(private readonly repository: EstrategiaProyectoRepository) {}

  execute(filters: EstrategiaProyectoFilters) {
    return this.repository.findAll(filters);
  }
}
