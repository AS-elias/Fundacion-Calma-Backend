import { Injectable } from '@nestjs/common';
import { CreateEstrategiaActividadDto } from '../dto/create-estrategia-actividad.dto';
import { EstrategiaActividadRepository } from '../../domain/repositories/estrategia-actividad.repository';

@Injectable()
export class CreateEstrategiaActividadUseCase {
  constructor(private readonly repository: EstrategiaActividadRepository) {}

  execute(dto: CreateEstrategiaActividadDto) {
    return this.repository.create(dto);
  }
}
