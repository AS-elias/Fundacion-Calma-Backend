import { Injectable, Inject } from '@nestjs/common';
import type { IComunidadRepository } from '../../domain/repositories/comunidad.repository';
import { COMUNIDAD_REPOSITORY } from '../../domain/repositories/comunidad.repository';

@Injectable()
export class ListarSolicitudesRecibidasUseCase {
  constructor(
    @Inject(COMUNIDAD_REPOSITORY)
    private readonly comunidadRepository: IComunidadRepository,
  ) {}

  async execute(usuarioId: number, estado?: string): Promise<any[]> {
    return this.comunidadRepository.obtenerSolicitudesRecibidas(
      usuarioId,
      estado,
    );
  }
}
