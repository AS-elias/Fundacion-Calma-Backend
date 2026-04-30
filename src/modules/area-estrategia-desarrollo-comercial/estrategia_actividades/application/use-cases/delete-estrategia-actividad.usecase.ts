import { Injectable } from '@nestjs/common';
import { EstrategiaActividadRepository } from '../../domain/repositories/estrategia-actividad.repository';

@Injectable()
export class DeleteEstrategiaActividadUseCase {
  constructor(private readonly repository: EstrategiaActividadRepository) {}

  async execute(id: number) {
    await this.repository.delete(id);
    return { message: 'Actividad eliminada exitosamente.' };
  }
}
