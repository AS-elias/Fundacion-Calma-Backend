import { Injectable } from '@nestjs/common';
import { UpdateAnalisisVenueDto } from '../dto/update-analisis-venue.dto';
import { AnalisisVenueRepository } from '../../domain/repositories/analisis-venue.repository';

@Injectable()
export class UpdateAnalisisVenueUseCase {
  constructor(private readonly repository: AnalisisVenueRepository) {}

  execute(id: number, dto: UpdateAnalisisVenueDto) {
    return this.repository.update(id, dto);
  }
}
