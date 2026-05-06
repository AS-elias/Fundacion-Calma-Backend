import { Injectable } from '@nestjs/common';
import { CreateEstrategiaEmpresaDto } from '../dto/create-estrategia-empresa.dto';
import { EstrategiaEmpresaRepository } from '../../domain/repositories/estrategia-empresa.repository';

@Injectable()
export class CreateEstrategiaEmpresaUseCase {
  constructor(private readonly repository: EstrategiaEmpresaRepository) {}

  execute(dto: CreateEstrategiaEmpresaDto) {
    return this.repository.create(dto);
  }
}
