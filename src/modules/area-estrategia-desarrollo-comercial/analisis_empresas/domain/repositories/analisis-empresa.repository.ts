import { CreateAnalisisEmpresaDto } from '../../application/dto/create-analisis-empresa.dto';
import { UpdateAnalisisEmpresaDto } from '../../application/dto/update-analisis-empresa.dto';
import { AnalisisEmpresa } from '../entities/analisis-empresa.entity';

export type AnalisisEmpresaFilters = {
  search?: string;
  estado?: string;
};

export abstract class AnalisisEmpresaRepository {
  abstract findAll(
    filters?: AnalisisEmpresaFilters,
  ): Promise<AnalisisEmpresa[]>;
  abstract findById(id: number): Promise<AnalisisEmpresa | null>;
  abstract create(dto: CreateAnalisisEmpresaDto): Promise<AnalisisEmpresa>;
  abstract update(
    id: number,
    dto: UpdateAnalisisEmpresaDto,
  ): Promise<AnalisisEmpresa>;
  abstract delete(id: number): Promise<void>;
}
