import { EstrategiaActividad } from '../entities/estrategia-actividad.entity';
import { EstrategiaActividadFilters } from '../interfaces/estrategia-actividad-filters.interface';

export abstract class EstrategiaActividadRepository {
  abstract findAll(
    filters: EstrategiaActividadFilters,
  ): Promise<EstrategiaActividad[]>;
  abstract findById(id: number): Promise<EstrategiaActividad | null>;
  abstract create(data: unknown): Promise<EstrategiaActividad>;
  abstract update(id: number, data: unknown): Promise<EstrategiaActividad>;
  abstract delete(id: number): Promise<void>;
}
