import { Injectable } from '@nestjs/common';
import {
  AnalisisColegioFilters,
  AnalisisColegioRepository,
} from '../../domain/repositories/analisis-colegio.repository';

@Injectable()
export class GetAnalisisColegiosUseCase {
  constructor(private readonly repository: AnalisisColegioRepository) {}

  execute(filters?: AnalisisColegioFilters) {
    return this.repository.findAll(filters);
  }
}
