import { Injectable } from '@nestjs/common';
import { UpdateEstrategiaProyectoEnlaceDto } from '../dto/update-estrategia-proyecto-enlace.dto';
import { EstrategiaProyectoEnlaceRepository } from '../../domain/repositories/estrategia-proyecto-enlace.repository';

@Injectable()
export class UpdateEstrategiaProyectoEnlaceUseCase {
  constructor(
    private readonly repository: EstrategiaProyectoEnlaceRepository,
  ) {}

  execute(id: number, dto: UpdateEstrategiaProyectoEnlaceDto) {
    return this.repository.update(id, dto);
  }
}
