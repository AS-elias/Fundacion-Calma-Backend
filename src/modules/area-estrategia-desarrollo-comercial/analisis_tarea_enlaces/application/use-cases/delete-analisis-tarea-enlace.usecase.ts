import { Injectable } from '@nestjs/common';
import { AnalisisTareaEnlaceRepository } from '../../domain/repositories/analisis-tarea-enlace.repository';

@Injectable()
export class DeleteAnalisisTareaEnlaceUseCase {
  constructor(private readonly repository: AnalisisTareaEnlaceRepository) {}

  async execute(id: number) {
    await this.repository.delete(id);
    return { message: 'Enlace eliminado exitosamente.' };
  }
}
