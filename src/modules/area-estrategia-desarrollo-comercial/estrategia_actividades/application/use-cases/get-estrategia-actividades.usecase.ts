import { Injectable } from '@nestjs/common';
import { EstrategiaActividadFilters } from '../../domain/interfaces/estrategia-actividad-filters.interface';
import { EstrategiaActividadRepository } from '../../domain/repositories/estrategia-actividad.repository';

@Injectable()
export class GetEstrategiaActividadesUseCase {
  constructor(private readonly repository: EstrategiaActividadRepository) {}

  execute(filters: EstrategiaActividadFilters) {
    return this.repository.findAll(filters);
  }
}
