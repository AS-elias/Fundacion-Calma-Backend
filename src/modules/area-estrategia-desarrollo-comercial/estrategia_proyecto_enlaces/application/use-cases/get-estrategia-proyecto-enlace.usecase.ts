import { Injectable } from '@nestjs/common';
import { EstrategiaProyectoEnlaceRepository } from '../../domain/repositories/estrategia-proyecto-enlace.repository';

@Injectable()
export class GetEstrategiaProyectoEnlaceUseCase {
  constructor(
    private readonly repository: EstrategiaProyectoEnlaceRepository,
  ) {}

  execute(id: number) {
    return this.repository.findById(id);
  }
}
