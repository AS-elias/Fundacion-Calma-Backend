import { Injectable, NotFoundException } from '@nestjs/common';
import { AnalisisColegioRepository } from '../../domain/repositories/analisis-colegio.repository';

@Injectable()
export class GetAnalisisColegioUseCase {
  constructor(private readonly repository: AnalisisColegioRepository) {}

  async execute(id: number) {
    const colegio = await this.repository.findById(id);

    if (!colegio) {
      throw new NotFoundException('El colegio no existe.');
    }

    return colegio;
  }
}
