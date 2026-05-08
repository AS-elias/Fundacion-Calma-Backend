import { Injectable, NotFoundException } from '@nestjs/common';
import { AnalisisVenueRepository } from '../../domain/repositories/analisis-venue.repository';

@Injectable()
export class GetAnalisisVenueUseCase {
  constructor(private readonly repository: AnalisisVenueRepository) {}

  async execute(id: number) {
    const venue = await this.repository.findById(id);
    if (!venue) throw new NotFoundException('El venue no existe.');
    return venue;
  }
}
