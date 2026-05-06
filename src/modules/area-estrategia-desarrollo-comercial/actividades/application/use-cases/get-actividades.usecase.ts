import { Injectable } from '@nestjs/common';
import { Actividad } from '../../domain/entities/actividad.entity';
import { ActividadRepository } from '../../domain/repositories/actividad.repository';
import { ActividadFilters } from '../../domain/types/actividad-filters.type';

@Injectable()
export class GetActividadesUseCase {
  constructor(private readonly actividadRepository: ActividadRepository) {}

  async execute(filters?: ActividadFilters): Promise<Actividad[]> {
    return this.actividadRepository.findAll(filters);
  }
}
