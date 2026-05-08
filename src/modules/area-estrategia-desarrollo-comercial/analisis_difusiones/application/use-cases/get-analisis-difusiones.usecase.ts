import { Injectable } from '@nestjs/common';
import {
  AnalisisDifusionFilters,
  AnalisisDifusionRepository,
} from '../../domain/repositories/analisis-difusion.repository';

@Injectable()
export class GetAnalisisDifusionesUseCase {
  constructor(private readonly repository: AnalisisDifusionRepository) {}

  execute(filters?: AnalisisDifusionFilters) {
    return this.repository.findAll(filters);
  }
}
