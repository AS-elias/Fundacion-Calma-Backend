import { Injectable } from '@nestjs/common';
import { UpdateEstrategiaActividadEnlaceDto } from '../dto/update-estrategia-actividad-enlace.dto';
import { EstrategiaActividadEnlaceRepository } from '../../domain/repositories/estrategia-actividad-enlace.repository';

@Injectable()
export class UpdateEstrategiaActividadEnlaceUseCase {
  constructor(
    private readonly repository: EstrategiaActividadEnlaceRepository,
  ) {}

  execute(id: number, dto: UpdateEstrategiaActividadEnlaceDto) {
    return this.repository.update(id, dto);
  }
}
