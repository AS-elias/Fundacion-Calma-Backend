import { Injectable } from '@nestjs/common';
import { EstrategiaActividadEnlaceRepository } from '../../domain/repositories/estrategia-actividad-enlace.repository';

@Injectable()
export class GetEstrategiaActividadEnlaceUseCase {
  constructor(
    private readonly repository: EstrategiaActividadEnlaceRepository,
  ) {}

  execute(id: number) {
    return this.repository.findById(id);
  }
}
