import { EstrategiaActividadEnlace } from '../entities/estrategia-actividad-enlace.entity';
import { EstrategiaActividadEnlaceFilters } from '../interfaces/estrategia-actividad-enlace-filters.interface';

export abstract class EstrategiaActividadEnlaceRepository {
  abstract findAll(
    filters: EstrategiaActividadEnlaceFilters,
  ): Promise<EstrategiaActividadEnlace[]>;
  abstract findById(id: number): Promise<EstrategiaActividadEnlace | null>;
  abstract create(data: unknown): Promise<EstrategiaActividadEnlace>;
  abstract update(
    id: number,
    data: unknown,
  ): Promise<EstrategiaActividadEnlace>;
  abstract delete(id: number): Promise<void>;
}
