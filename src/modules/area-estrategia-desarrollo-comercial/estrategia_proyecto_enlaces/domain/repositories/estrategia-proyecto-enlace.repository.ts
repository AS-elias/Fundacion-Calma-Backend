import { EstrategiaProyectoEnlace } from '../entities/estrategia-proyecto-enlace.entity';
import { EstrategiaProyectoEnlaceFilters } from '../interfaces/estrategia-proyecto-enlace-filters.interface';

export abstract class EstrategiaProyectoEnlaceRepository {
  abstract findAll(
    filters: EstrategiaProyectoEnlaceFilters,
  ): Promise<EstrategiaProyectoEnlace[]>;
  abstract findById(id: number): Promise<EstrategiaProyectoEnlace | null>;
  abstract create(data: unknown): Promise<EstrategiaProyectoEnlace>;
  abstract update(id: number, data: unknown): Promise<EstrategiaProyectoEnlace>;
  abstract delete(id: number): Promise<void>;
}
