import { CreateAnalisisColegioDto } from '../../application/dto/create-analisis-colegio.dto';
import { UpdateAnalisisColegioDto } from '../../application/dto/update-analisis-colegio.dto';
import { AnalisisColegio } from '../entities/analisis-colegio.entity';

export type AnalisisColegioFilters = {
  search?: string;
  tipo?: string;
};

export abstract class AnalisisColegioRepository {
  abstract findAll(
    filters?: AnalisisColegioFilters,
  ): Promise<AnalisisColegio[]>;
  abstract findById(id: number): Promise<AnalisisColegio | null>;
  abstract create(dto: CreateAnalisisColegioDto): Promise<AnalisisColegio>;
  abstract update(
    id: number,
    dto: UpdateAnalisisColegioDto,
  ): Promise<AnalisisColegio>;
  abstract delete(id: number): Promise<void>;
}
