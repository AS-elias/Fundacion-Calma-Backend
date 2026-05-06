import { Injectable } from '@nestjs/common';
import {
  AnalisisVenueFilters,
  AnalisisVenueRepository,
} from '../../domain/repositories/analisis-venue.repository';

@Injectable()
export class GetAnalisisVenuesUseCase {
  constructor(private readonly repository: AnalisisVenueRepository) {}

  execute(filters?: AnalisisVenueFilters) {
    return this.repository.findAll(filters);
  }
}
