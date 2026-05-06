import { Injectable } from '@nestjs/common';
import { CreateAnalisisTareaEnlaceDto } from '../dto/create-analisis-tarea-enlace.dto';
import { AnalisisTareaEnlaceRepository } from '../../domain/repositories/analisis-tarea-enlace.repository';

@Injectable()
export class CreateAnalisisTareaEnlaceUseCase {
  constructor(private readonly repository: AnalisisTareaEnlaceRepository) {}

  execute(dto: CreateAnalisisTareaEnlaceDto) {
    return this.repository.create(dto);
  }
}
