import { Injectable } from '@nestjs/common';
import { AnalisisDifusionRepository } from '../../domain/repositories/analisis-difusion.repository';

@Injectable()
export class DeleteAnalisisDifusionUseCase {
  constructor(private readonly repository: AnalisisDifusionRepository) {}

  async execute(id: number) {
    await this.repository.delete(id);
    return { message: 'Difusion eliminada exitosamente.' };
  }
}
