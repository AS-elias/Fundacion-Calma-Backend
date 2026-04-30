import { Injectable } from '@nestjs/common';
import { UpdateEstrategiaActividadDto } from '../dto/update-estrategia-actividad.dto';
import { EstrategiaActividadRepository } from '../../domain/repositories/estrategia-actividad.repository';

@Injectable()
export class UpdateEstrategiaActividadUseCase {
  constructor(private readonly repository: EstrategiaActividadRepository) {}

  execute(id: number, dto: UpdateEstrategiaActividadDto) {
    return this.repository.update(id, dto);
  }
}
