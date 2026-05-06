import { Injectable } from '@nestjs/common';
import {
  AnalisisTareaFilters,
  AnalisisTareaRepository,
} from '../../domain/repositories/analisis-tarea.repository';

@Injectable()
export class GetAnalisisTareasUseCase {
  constructor(private readonly repository: AnalisisTareaRepository) {}

  execute(filters?: AnalisisTareaFilters) {
    return this.repository.findAll(filters);
  }
}
