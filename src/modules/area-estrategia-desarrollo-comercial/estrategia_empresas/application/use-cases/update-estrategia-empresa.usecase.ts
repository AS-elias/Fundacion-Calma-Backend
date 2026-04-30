import { Injectable } from '@nestjs/common';
import { UpdateEstrategiaEmpresaDto } from '../dto/update-estrategia-empresa.dto';
import { EstrategiaEmpresaRepository } from '../../domain/repositories/estrategia-empresa.repository';

@Injectable()
export class UpdateEstrategiaEmpresaUseCase {
  constructor(private readonly repository: EstrategiaEmpresaRepository) {}

  execute(id: number, dto: UpdateEstrategiaEmpresaDto) {
    return this.repository.update(id, dto);
  }
}
