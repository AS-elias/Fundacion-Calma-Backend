import { Injectable, Inject } from '@nestjs/common';
import type { IComunidadRepository } from '../../domain/repositories/comunidad.repository';
import { COMUNIDAD_REPOSITORY } from '../../domain/repositories/comunidad.repository';
import { ContactoEntity } from '../../domain/entities/contacto.entity';

@Injectable()
export class SearchContactosUseCase {
  constructor(
    @Inject(COMUNIDAD_REPOSITORY)
    private readonly comunidadRepository: IComunidadRepository,
  ) {}

  async execute(query: string, usuarioId: number): Promise<ContactoEntity[]> {
    return await this.comunidadRepository.buscarUsuariosActivos(
      query,
      usuarioId,
    );
  }
}
