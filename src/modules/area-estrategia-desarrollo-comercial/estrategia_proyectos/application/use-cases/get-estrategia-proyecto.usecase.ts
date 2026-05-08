import { Injectable } from '@nestjs/common';
import { EstrategiaProyectoRepository } from '../../domain/repositories/estrategia-proyecto.repository';

@Injectable()
export class GetEstrategiaProyectoUseCase {
  constructor(private readonly repository: EstrategiaProyectoRepository) {}

  execute(id: number) {
    return this.repository.findById(id);
  }
}
