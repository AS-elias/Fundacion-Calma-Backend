import { Injectable } from '@nestjs/common';
import {
  AnalisisEmpresaFilters,
  AnalisisEmpresaRepository,
} from '../../domain/repositories/analisis-empresa.repository';

@Injectable()
export class GetAnalisisEmpresasUseCase {
  constructor(private readonly repository: AnalisisEmpresaRepository) {}

  execute(filters?: AnalisisEmpresaFilters) {
    return this.repository.findAll(filters);
  }
}
