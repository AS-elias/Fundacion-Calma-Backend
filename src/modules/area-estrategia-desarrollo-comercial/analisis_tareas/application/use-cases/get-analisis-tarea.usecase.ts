import { Injectable, NotFoundException } from '@nestjs/common';
import { AnalisisTareaRepository } from '../../domain/repositories/analisis-tarea.repository';

@Injectable()
export class GetAnalisisTareaUseCase {
  constructor(private readonly repository: AnalisisTareaRepository) {}

  async execute(id: number) {
    const tarea = await this.repository.findById(id);
    if (!tarea) throw new NotFoundException('La tarea no existe.');
    return tarea;
  }
}
