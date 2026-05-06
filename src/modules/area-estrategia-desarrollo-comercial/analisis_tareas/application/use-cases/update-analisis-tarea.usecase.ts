import { Injectable } from '@nestjs/common';
import { UpdateAnalisisTareaDto } from '../dto/update-analisis-tarea.dto';
import { AnalisisTareaRepository } from '../../domain/repositories/analisis-tarea.repository';

@Injectable()
export class UpdateAnalisisTareaUseCase {
  constructor(private readonly repository: AnalisisTareaRepository) {}

  execute(id: number, dto: UpdateAnalisisTareaDto) {
    return this.repository.update(id, dto);
  }
}
