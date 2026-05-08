import { Injectable } from '@nestjs/common';
import { EstrategiaProyectoEnlaceRepository } from '../../domain/repositories/estrategia-proyecto-enlace.repository';

@Injectable()
export class DeleteEstrategiaProyectoEnlaceUseCase {
  constructor(
    private readonly repository: EstrategiaProyectoEnlaceRepository,
  ) {}

  async execute(id: number) {
    await this.repository.delete(id);
    return { message: 'Enlace eliminado exitosamente.' };
  }
}
