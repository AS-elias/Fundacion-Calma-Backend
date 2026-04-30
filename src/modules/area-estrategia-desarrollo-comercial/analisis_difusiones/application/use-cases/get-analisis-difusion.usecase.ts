import { Injectable, NotFoundException } from '@nestjs/common';
import { AnalisisDifusionRepository } from '../../domain/repositories/analisis-difusion.repository';

@Injectable()
export class GetAnalisisDifusionUseCase {
  constructor(private readonly repository: AnalisisDifusionRepository) {}

  async execute(id: number) {
    const difusion = await this.repository.findById(id);
    if (!difusion) throw new NotFoundException('La difusion no existe.');
    return difusion;
  }
}
