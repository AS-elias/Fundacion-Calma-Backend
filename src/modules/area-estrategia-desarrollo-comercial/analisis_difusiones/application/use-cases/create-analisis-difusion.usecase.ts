import { Injectable } from '@nestjs/common';
import { CreateAnalisisDifusionDto } from '../dto/create-analisis-difusion.dto';
import { AnalisisDifusionRepository } from '../../domain/repositories/analisis-difusion.repository';

@Injectable()
export class CreateAnalisisDifusionUseCase {
  constructor(private readonly repository: AnalisisDifusionRepository) {}

  execute(dto: CreateAnalisisDifusionDto) {
    return this.repository.create(dto);
  }
}
