import { Injectable, Inject } from '@nestjs/common';
import {
  type ISalaRepository,
  SALA_REPOSITORY,
} from '../../domain/repositories/sala.repository';

@Injectable()
export class GetSalasUseCase {
  constructor(
    @Inject(SALA_REPOSITORY)
    private readonly salaRepository: ISalaRepository,
  ) {}

  async execute() {
    const salas = await this.salaRepository.obtenerSalasRegulares();

    const grupos = new Map<string, any>();

    for (const sala of salas) {
      if (!grupos.has(sala.area)) {
        grupos.set(sala.area, {
          area: sala.area,
          salas: [],
        });
      }

      grupos.get(sala.area).salas.push({
        id: sala.id,
        nombre: sala.nombre,
        link: sala.link,
        descripcion: sala.descripcion,
      });
    }

    return Array.from(grupos.values());
  }
}
