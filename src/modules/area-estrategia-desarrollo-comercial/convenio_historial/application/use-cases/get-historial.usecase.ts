import { Injectable } from '@nestjs/common';
import { ConvenioHistorial } from '../../domain/entities/historial.entity';
import { HistorialRepository } from '../../domain/repositories/historial.repository';

@Injectable()
export class GetHistorialUseCase {
  constructor(private readonly historialRepository: HistorialRepository) {}

  async execute(convenioId: number): Promise<ConvenioHistorial[]> {
    return this.historialRepository.findByConvenio(convenioId);
  }
}
