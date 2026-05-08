import { Injectable } from '@nestjs/common';
import {
  AnalisisTareaEnlaceFilters,
  AnalisisTareaEnlaceRepository,
} from '../../domain/repositories/analisis-tarea-enlace.repository';

@Injectable()
export class GetAnalisisTareaEnlacesUseCase {
  constructor(private readonly repository: AnalisisTareaEnlaceRepository) {}

  execute(filters?: AnalisisTareaEnlaceFilters) {
    return this.repository.findAll(filters);
  }
}
