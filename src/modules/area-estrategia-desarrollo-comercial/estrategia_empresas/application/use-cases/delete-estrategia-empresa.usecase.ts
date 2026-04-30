import { Injectable } from '@nestjs/common';
import { EstrategiaEmpresaRepository } from '../../domain/repositories/estrategia-empresa.repository';

@Injectable()
export class DeleteEstrategiaEmpresaUseCase {
  constructor(private readonly repository: EstrategiaEmpresaRepository) {}

  async execute(id: number) {
    await this.repository.delete(id);
    return { message: 'Empresa eliminada exitosamente.' };
  }
}
