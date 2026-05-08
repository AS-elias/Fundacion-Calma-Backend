import { Injectable } from '@nestjs/common';
import { UpdateEstrategiaProyectoDto } from '../dto/update-estrategia-proyecto.dto';
import { EstrategiaProyectoRepository } from '../../domain/repositories/estrategia-proyecto.repository';

@Injectable()
export class UpdateEstrategiaProyectoUseCase {
  constructor(private readonly repository: EstrategiaProyectoRepository) {}

  execute(id: number, dto: UpdateEstrategiaProyectoDto) {
    return this.repository.update(id, dto);
  }
}
