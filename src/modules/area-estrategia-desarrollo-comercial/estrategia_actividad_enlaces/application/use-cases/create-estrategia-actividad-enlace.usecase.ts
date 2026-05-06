import { Injectable } from '@nestjs/common';
import { CreateEstrategiaActividadEnlaceDto } from '../dto/create-estrategia-actividad-enlace.dto';
import { EstrategiaActividadEnlaceRepository } from '../../domain/repositories/estrategia-actividad-enlace.repository';

@Injectable()
export class CreateEstrategiaActividadEnlaceUseCase {
  constructor(
    private readonly repository: EstrategiaActividadEnlaceRepository,
  ) {}

  execute(dto: CreateEstrategiaActividadEnlaceDto) {
    return this.repository.create(dto);
  }
}
