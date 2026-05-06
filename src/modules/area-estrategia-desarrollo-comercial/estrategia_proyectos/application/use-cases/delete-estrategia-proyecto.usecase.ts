import { Injectable } from '@nestjs/common';
import { EstrategiaProyectoRepository } from '../../domain/repositories/estrategia-proyecto.repository';

@Injectable()
export class DeleteEstrategiaProyectoUseCase {
  constructor(private readonly repository: EstrategiaProyectoRepository) {}

  async execute(id: number) {
    await this.repository.delete(id);
    return { message: 'Proyecto eliminado exitosamente.' };
  }
}
