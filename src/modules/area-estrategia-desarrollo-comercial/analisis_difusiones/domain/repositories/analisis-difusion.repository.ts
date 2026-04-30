import { CreateAnalisisDifusionDto } from '../../application/dto/create-analisis-difusion.dto';
import { UpdateAnalisisDifusionDto } from '../../application/dto/update-analisis-difusion.dto';
import { AnalisisDifusion } from '../entities/analisis-difusion.entity';

export type AnalisisDifusionFilters = {
  search?: string;
  estado?: string;
};

export abstract class AnalisisDifusionRepository {
  abstract findAll(
    filters?: AnalisisDifusionFilters,
  ): Promise<AnalisisDifusion[]>;
  abstract findById(id: number): Promise<AnalisisDifusion | null>;
  abstract create(dto: CreateAnalisisDifusionDto): Promise<AnalisisDifusion>;
  abstract update(
    id: number,
    dto: UpdateAnalisisDifusionDto,
  ): Promise<AnalisisDifusion>;
  abstract delete(id: number): Promise<void>;
}
