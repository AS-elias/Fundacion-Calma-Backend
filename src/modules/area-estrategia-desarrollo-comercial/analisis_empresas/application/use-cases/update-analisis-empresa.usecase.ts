import { Injectable } from '@nestjs/common';
import { UpdateAnalisisEmpresaDto } from '../dto/update-analisis-empresa.dto';
import { AnalisisEmpresaRepository } from '../../domain/repositories/analisis-empresa.repository';

@Injectable()
export class UpdateAnalisisEmpresaUseCase {
  constructor(private readonly repository: AnalisisEmpresaRepository) {}

  execute(id: number, dto: UpdateAnalisisEmpresaDto) {
    return this.repository.update(id, dto);
  }
}
