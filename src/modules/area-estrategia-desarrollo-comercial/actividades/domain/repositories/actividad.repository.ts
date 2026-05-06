import { Actividad } from '../entities/actividad.entity';
import { ActividadFilters } from '../types/actividad-filters.type';

export abstract class ActividadRepository {
  abstract create(actividad: Actividad): Promise<Actividad>;

  abstract findAll(filters?: ActividadFilters): Promise<Actividad[]>;

  abstract findById(id: number): Promise<Actividad | null>;

  abstract update(
    id: number,
    actividad: Partial<Actividad>,
  ): Promise<Actividad>;
}
