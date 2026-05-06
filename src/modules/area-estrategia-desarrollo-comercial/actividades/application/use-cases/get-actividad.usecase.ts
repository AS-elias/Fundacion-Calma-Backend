import { Injectable, NotFoundException } from '@nestjs/common';
import { Actividad } from '../../domain/entities/actividad.entity';
import { ActividadRepository } from '../../domain/repositories/actividad.repository';

@Injectable()
export class GetActividadUseCase {
  constructor(private readonly actividadRepository: ActividadRepository) {}

  async execute(id: number): Promise<Actividad> {
    const actividad = await this.actividadRepository.findById(id);

    if (!actividad) {
      throw new NotFoundException('La actividad no existe.');
    }

    return actividad;
  }
}
