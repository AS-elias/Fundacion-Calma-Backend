import { Injectable } from '@nestjs/common';
import { CreateAnalisisTareaDto } from '../dto/create-analisis-tarea.dto';
import { AnalisisTareaRepository } from '../../domain/repositories/analisis-tarea.repository';

@Injectable()
export class CreateAnalisisTareaUseCase {
  constructor(private readonly repository: AnalisisTareaRepository) {}

  execute(dto: CreateAnalisisTareaDto) {
    return this.repository.create(dto);
  }
}
