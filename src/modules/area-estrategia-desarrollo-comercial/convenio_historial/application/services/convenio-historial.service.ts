import { Injectable } from '@nestjs/common';
import { ConvenioHistorial } from '../../domain/entities/historial.entity';
import { HistorialRepository } from '../../domain/repositories/historial.repository';

@Injectable()
export class ConvenioHistorialService {
  constructor(private readonly historialRepository: HistorialRepository) {}

  async registrar(
    convenioId: number,
    accion: string,
    descripcion: string,
    usuarioId?: number | null,
  ): Promise<ConvenioHistorial> {
    const historial = new ConvenioHistorial(
      0,
      convenioId,
      usuarioId ?? null,
      accion,
      descripcion,
      new Date(),
    );

    return this.historialRepository.create(historial);
  }
}
