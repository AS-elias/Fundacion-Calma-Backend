import { Injectable } from '@nestjs/common';
import { EstrategiaEmpresaRepository } from '../../domain/repositories/estrategia-empresa.repository';

@Injectable()
export class GetEstrategiaEmpresaUseCase {
  constructor(private readonly repository: EstrategiaEmpresaRepository) {}

  execute(id: number) {
    return this.repository.findById(id);
  }
}
