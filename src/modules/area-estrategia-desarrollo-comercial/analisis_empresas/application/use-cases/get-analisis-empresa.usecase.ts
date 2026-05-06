import { Injectable, NotFoundException } from '@nestjs/common';
import { AnalisisEmpresaRepository } from '../../domain/repositories/analisis-empresa.repository';

@Injectable()
export class GetAnalisisEmpresaUseCase {
  constructor(private readonly repository: AnalisisEmpresaRepository) {}

  async execute(id: number) {
    const empresa = await this.repository.findById(id);
    if (!empresa) throw new NotFoundException('La empresa no existe.');
    return empresa;
  }
}
