import { Injectable } from '@nestjs/common';
import { AnalisisVenueRepository } from '../../domain/repositories/analisis-venue.repository';

@Injectable()
export class DeleteAnalisisVenueUseCase {
  constructor(private readonly repository: AnalisisVenueRepository) {}

  async execute(id: number) {
    await this.repository.delete(id);
    return { message: 'Venue eliminado exitosamente.' };
  }
}
