import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { type ISalaRepository, SALA_REPOSITORY } from '../../domain/repositories/sala.repository';

@Injectable()
export class GetSalaGeneralUseCase {
  constructor(
    @Inject(SALA_REPOSITORY)
    private readonly salaRepository: ISalaRepository,
  ) {}

  async execute() {
    const sala = await this.salaRepository.obtenerSalaGeneral();
    
    if (!sala) {
      throw new NotFoundException('Sala general no configurada aún');
    }
    return sala;
  }
}