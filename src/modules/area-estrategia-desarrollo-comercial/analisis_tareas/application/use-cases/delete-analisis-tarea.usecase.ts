import { Injectable } from '@nestjs/common';
import { AnalisisTareaRepository } from '../../domain/repositories/analisis-tarea.repository';

@Injectable()
export class DeleteAnalisisTareaUseCase {
  constructor(private readonly repository: AnalisisTareaRepository) {}

  async execute(id: number) {
    await this.repository.delete(id);
    return { message: 'Tarea eliminada exitosamente.' };
  }
}
