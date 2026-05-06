import { CreateAnalisisTareaDto } from '../../application/dto/create-analisis-tarea.dto';
import { UpdateAnalisisTareaDto } from '../../application/dto/update-analisis-tarea.dto';
import { AnalisisTarea } from '../entities/analisis-tarea.entity';

export type AnalisisTareaFilters = {
  search?: string;
  estado?: string;
};

export abstract class AnalisisTareaRepository {
  abstract findAll(filters?: AnalisisTareaFilters): Promise<AnalisisTarea[]>;
  abstract findById(id: number): Promise<AnalisisTarea | null>;
  abstract create(dto: CreateAnalisisTareaDto): Promise<AnalisisTarea>;
  abstract update(
    id: number,
    dto: UpdateAnalisisTareaDto,
  ): Promise<AnalisisTarea>;
  abstract delete(id: number): Promise<void>;
}
