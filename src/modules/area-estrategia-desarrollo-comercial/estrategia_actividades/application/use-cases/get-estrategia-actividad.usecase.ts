import { Injectable } from '@nestjs/common';
import { EstrategiaActividadRepository } from '../../domain/repositories/estrategia-actividad.repository';

@Injectable()
export class GetEstrategiaActividadUseCase {
  constructor(private readonly repository: EstrategiaActividadRepository) {}

  execute(id: number) {
    return this.repository.findById(id);
  }
}
