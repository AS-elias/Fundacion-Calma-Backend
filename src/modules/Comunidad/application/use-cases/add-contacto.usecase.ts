import { Injectable, Inject } from '@nestjs/common';
import type { IComunidadRepository } from '../../domain/repositories/comunidad.repository';
import { COMUNIDAD_REPOSITORY } from '../../domain/repositories/comunidad.repository';

@Injectable()
export class AddContactoUseCase {
  constructor(
    @Inject(COMUNIDAD_REPOSITORY)
    private readonly comunidadRepository: IComunidadRepository,
  ) {}

  async execute(contactoId: number, usuarioId: number): Promise<void> {
    await this.comunidadRepository.agregarContacto(contactoId, usuarioId);
  }
}
