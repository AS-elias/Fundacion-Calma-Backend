import { EstrategiaEmpresa } from '../entities/estrategia-empresa.entity';
import { EstrategiaEmpresaFilters } from '../interfaces/estrategia-empresa-filters.interface';

export abstract class EstrategiaEmpresaRepository {
  abstract findAll(
    filters: EstrategiaEmpresaFilters,
  ): Promise<EstrategiaEmpresa[]>;
  abstract findById(id: number): Promise<EstrategiaEmpresa | null>;
  abstract create(data: unknown): Promise<EstrategiaEmpresa>;
  abstract update(id: number, data: unknown): Promise<EstrategiaEmpresa>;
  abstract delete(id: number): Promise<void>;
}
