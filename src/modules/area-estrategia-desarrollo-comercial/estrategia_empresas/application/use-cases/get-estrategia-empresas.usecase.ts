import { Injectable } from '@nestjs/common';
import { EstrategiaEmpresaFilters } from '../../domain/interfaces/estrategia-empresa-filters.interface';
import { EstrategiaEmpresaRepository } from '../../domain/repositories/estrategia-empresa.repository';

@Injectable()
export class GetEstrategiaEmpresasUseCase {
  constructor(private readonly repository: EstrategiaEmpresaRepository) {}

  execute(filters: EstrategiaEmpresaFilters) {
    return this.repository.findAll(filters);
  }
}
