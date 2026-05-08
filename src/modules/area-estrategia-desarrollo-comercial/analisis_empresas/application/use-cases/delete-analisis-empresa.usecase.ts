import { Injectable } from '@nestjs/common';
import { AnalisisEmpresaRepository } from '../../domain/repositories/analisis-empresa.repository';

@Injectable()
export class DeleteAnalisisEmpresaUseCase {
  constructor(private readonly repository: AnalisisEmpresaRepository) {}

  async execute(id: number) {
    await this.repository.delete(id);
    return { message: 'Empresa eliminada exitosamente.' };
  }
}
