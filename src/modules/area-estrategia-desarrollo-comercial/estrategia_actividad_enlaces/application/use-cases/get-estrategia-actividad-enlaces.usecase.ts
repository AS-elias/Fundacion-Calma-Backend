import { Injectable } from '@nestjs/common';
import { EstrategiaActividadEnlaceFilters } from '../../domain/interfaces/estrategia-actividad-enlace-filters.interface';
import { EstrategiaActividadEnlaceRepository } from '../../domain/repositories/estrategia-actividad-enlace.repository';

@Injectable()
export class GetEstrategiaActividadEnlacesUseCase {
  constructor(
    private readonly repository: EstrategiaActividadEnlaceRepository,
  ) {}

  execute(filters: EstrategiaActividadEnlaceFilters) {
    return this.repository.findAll(filters);
  }
}
