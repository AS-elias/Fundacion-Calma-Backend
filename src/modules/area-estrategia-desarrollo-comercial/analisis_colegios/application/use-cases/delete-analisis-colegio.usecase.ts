import { Injectable } from '@nestjs/common';
import { AnalisisColegioRepository } from '../../domain/repositories/analisis-colegio.repository';

@Injectable()
export class DeleteAnalisisColegioUseCase {
  constructor(private readonly repository: AnalisisColegioRepository) {}

  async execute(id: number) {
    await this.repository.delete(id);
    return { message: 'Colegio eliminado exitosamente.' };
  }
}
