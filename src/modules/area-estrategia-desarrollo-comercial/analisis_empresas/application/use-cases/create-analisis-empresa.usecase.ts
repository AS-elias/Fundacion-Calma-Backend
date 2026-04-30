import { Injectable } from '@nestjs/common';
import { CreateAnalisisEmpresaDto } from '../dto/create-analisis-empresa.dto';
import { AnalisisEmpresaRepository } from '../../domain/repositories/analisis-empresa.repository';

@Injectable()
export class CreateAnalisisEmpresaUseCase {
  constructor(private readonly repository: AnalisisEmpresaRepository) {}

  execute(dto: CreateAnalisisEmpresaDto) {
    return this.repository.create(dto);
  }
}
