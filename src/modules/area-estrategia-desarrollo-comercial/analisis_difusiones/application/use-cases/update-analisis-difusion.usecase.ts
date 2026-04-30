import { Injectable } from '@nestjs/common';
import { UpdateAnalisisDifusionDto } from '../dto/update-analisis-difusion.dto';
import { AnalisisDifusionRepository } from '../../domain/repositories/analisis-difusion.repository';

@Injectable()
export class UpdateAnalisisDifusionUseCase {
  constructor(private readonly repository: AnalisisDifusionRepository) {}

  execute(id: number, dto: UpdateAnalisisDifusionDto) {
    return this.repository.update(id, dto);
  }
}
