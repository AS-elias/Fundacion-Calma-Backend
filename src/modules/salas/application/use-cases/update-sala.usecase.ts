import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { ISalaRepository } from '../../domain/repositories/sala.repository';
import { SALA_REPOSITORY } from '../../domain/repositories/sala.repository';
import { UpdateSalaDto } from '../update-sala.dto';

@Injectable()
export class UpdateSalaUseCase {
  constructor(
    @Inject(SALA_REPOSITORY)
    private readonly salaRepository: ISalaRepository,
  ) {}

  async execute(id: number, data: UpdateSalaDto) {
    const existe = await this.salaRepository.verificarSalaExiste(id);
    if (!existe) {
      throw new NotFoundException(`La sala de trabajo con id ${id} no existe`);
    }

    return this.salaRepository.actualizarSala(id, data);
  }
}
