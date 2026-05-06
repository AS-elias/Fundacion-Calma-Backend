import { Injectable } from '@nestjs/common';
import { CreateEstrategiaProyectoEnlaceDto } from '../dto/create-estrategia-proyecto-enlace.dto';
import { EstrategiaProyectoEnlaceRepository } from '../../domain/repositories/estrategia-proyecto-enlace.repository';

@Injectable()
export class CreateEstrategiaProyectoEnlaceUseCase {
  constructor(
    private readonly repository: EstrategiaProyectoEnlaceRepository,
  ) {}

  execute(dto: CreateEstrategiaProyectoEnlaceDto) {
    return this.repository.create(dto);
  }
}
