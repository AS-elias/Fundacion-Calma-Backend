import { CreateAnalisisTareaEnlaceDto } from '../../application/dto/create-analisis-tarea-enlace.dto';
import { UpdateAnalisisTareaEnlaceDto } from '../../application/dto/update-analisis-tarea-enlace.dto';
import { AnalisisTareaEnlace } from '../entities/analisis-tarea-enlace.entity';

export type AnalisisTareaEnlaceFilters = {
  tareaId?: number;
};

export abstract class AnalisisTareaEnlaceRepository {
  abstract findAll(
    filters?: AnalisisTareaEnlaceFilters,
  ): Promise<AnalisisTareaEnlace[]>;
  abstract findById(id: number): Promise<AnalisisTareaEnlace | null>;
  abstract create(
    dto: CreateAnalisisTareaEnlaceDto,
  ): Promise<AnalisisTareaEnlace>;
  abstract update(
    id: number,
    dto: UpdateAnalisisTareaEnlaceDto,
  ): Promise<AnalisisTareaEnlace>;
  abstract delete(id: number): Promise<void>;
}
