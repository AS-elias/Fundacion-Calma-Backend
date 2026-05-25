import { Injectable, Inject } from '@nestjs/common';
import {
  type ISalaRepository,
  SALA_REPOSITORY,
} from '../../domain/repositories/sala.repository';
import { CreateSalaDto } from '../../create-sala.dto';

@Injectable()
export class CreateSalaUseCase {
  constructor(
    @Inject(SALA_REPOSITORY)
    private readonly salaRepository: ISalaRepository,
  ) {}

  async execute(params: CreateSalaDto) {
    // Llamamos al puerto (interfaz) para guardar la sala
    return this.salaRepository.crearSala(params);
  }
}
