import { Injectable } from '@nestjs/common';
import { HistorialRepository } from '../../domain/repositories/historial.repository';

@Injectable()
export class ClearHistorialUseCase {
  constructor(private readonly historialRepository: HistorialRepository) {}

  async execute(convenioId: number): Promise<number> {
    return this.historialRepository.deleteByConvenio(convenioId);
  }
}
