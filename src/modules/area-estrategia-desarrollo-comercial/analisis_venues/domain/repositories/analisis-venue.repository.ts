import { CreateAnalisisVenueDto } from '../../application/dto/create-analisis-venue.dto';
import { UpdateAnalisisVenueDto } from '../../application/dto/update-analisis-venue.dto';
import { AnalisisVenue } from '../entities/analisis-venue.entity';

export type AnalisisVenueFilters = {
  search?: string;
  estado?: string;
};

export abstract class AnalisisVenueRepository {
  abstract findAll(filters?: AnalisisVenueFilters): Promise<AnalisisVenue[]>;
  abstract findById(id: number): Promise<AnalisisVenue | null>;
  abstract create(dto: CreateAnalisisVenueDto): Promise<AnalisisVenue>;
  abstract update(
    id: number,
    dto: UpdateAnalisisVenueDto,
  ): Promise<AnalisisVenue>;
  abstract delete(id: number): Promise<void>;
}
