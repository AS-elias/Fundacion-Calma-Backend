import { Injectable } from '@nestjs/common';
import { EstrategiaActividadEnlaceRepository } from '../../domain/repositories/estrategia-actividad-enlace.repository';

@Injectable()
export class DeleteEstrategiaActividadEnlaceUseCase {
  constructor(
    private readonly repository: EstrategiaActividadEnlaceRepository,
  ) {}

  async execute(id: number) {
    await this.repository.delete(id);
    return { message: 'Enlace eliminado exitosamente.' };
  }
}
