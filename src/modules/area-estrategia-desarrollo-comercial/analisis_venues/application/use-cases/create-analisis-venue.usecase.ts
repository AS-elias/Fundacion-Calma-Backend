import { Injectable } from '@nestjs/common';
import { CreateAnalisisVenueDto } from '../dto/create-analisis-venue.dto';
import { AnalisisVenueRepository } from '../../domain/repositories/analisis-venue.repository';

@Injectable()
export class CreateAnalisisVenueUseCase {
  constructor(private readonly repository: AnalisisVenueRepository) {}

  execute(dto: CreateAnalisisVenueDto) {
    return this.repository.create(dto);
  }
}
