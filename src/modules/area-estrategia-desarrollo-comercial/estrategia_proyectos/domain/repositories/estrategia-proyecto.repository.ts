import { EstrategiaProyecto } from '../entities/estrategia-proyecto.entity';
import { EstrategiaProyectoFilters } from '../interfaces/estrategia-proyecto-filters.interface';

export abstract class EstrategiaProyectoRepository {
  abstract findAll(
    filters: EstrategiaProyectoFilters,
  ): Promise<EstrategiaProyecto[]>;
  abstract findById(id: number): Promise<EstrategiaProyecto | null>;
  abstract create(data: unknown): Promise<EstrategiaProyecto>;
  abstract update(id: number, data: unknown): Promise<EstrategiaProyecto>;
  abstract delete(id: number): Promise<void>;
}
