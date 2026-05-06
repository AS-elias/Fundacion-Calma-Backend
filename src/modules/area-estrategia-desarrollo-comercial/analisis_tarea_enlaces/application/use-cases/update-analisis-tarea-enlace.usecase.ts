import { Injectable } from '@nestjs/common';
import { UpdateAnalisisTareaEnlaceDto } from '../dto/update-analisis-tarea-enlace.dto';
import { AnalisisTareaEnlaceRepository } from '../../domain/repositories/analisis-tarea-enlace.repository';

@Injectable()
export class UpdateAnalisisTareaEnlaceUseCase {
  constructor(private readonly repository: AnalisisTareaEnlaceRepository) {}

  execute(id: number, dto: UpdateAnalisisTareaEnlaceDto) {
    return this.repository.update(id, dto);
  }
}
