import { Injectable } from '@nestjs/common';
import { CreateEstrategiaProyectoDto } from '../dto/create-estrategia-proyecto.dto';
import { EstrategiaProyectoRepository } from '../../domain/repositories/estrategia-proyecto.repository';

@Injectable()
export class CreateEstrategiaProyectoUseCase {
  constructor(private readonly repository: EstrategiaProyectoRepository) {}

  execute(dto: CreateEstrategiaProyectoDto) {
    return this.repository.create(dto);
  }
}
