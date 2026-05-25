import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  type ISalaRepository,
  SALA_REPOSITORY,
} from '../../domain/repositories/sala.repository';

@Injectable()
export class DeleteSalaUseCase {
  constructor(
    @Inject(SALA_REPOSITORY)
    private readonly salaRepository: ISalaRepository,
  ) {}

  async execute(id: number) {
    const existe = await this.salaRepository.verificarSalaExiste(id);
    if (!existe) {
      throw new NotFoundException(`La sala con ID ${id} no existe`);
    }
    await this.salaRepository.eliminarSala(id);
    return { mensaje: 'Sala eliminada exitosamente' };
  }
}
