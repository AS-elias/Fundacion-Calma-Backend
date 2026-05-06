import { Injectable, NotFoundException } from '@nestjs/common';
import { ComentarioRepository } from '../../domain/repositories/comentario.repository';
import { ConvenioHistorialService } from '../../../convenio_historial/application/services/convenio-historial.service';

@Injectable()
export class DeleteComentarioUseCase {
  constructor(
    private readonly comentarioRepository: ComentarioRepository,
    private readonly convenioHistorialService: ConvenioHistorialService,
  ) {}

  async execute(id: number): Promise<void> {
    const comentario = await this.comentarioRepository.findById(id);

    if (!comentario) {
      throw new NotFoundException('El comentario no existe.');
    }

    await this.comentarioRepository.delete(id);

    await this.convenioHistorialService.registrar(
      comentario.convenioId,
      'COMENTARIO_ELIMINADO',
      `Comentario eliminado: ${comentario.comentario}`,
      comentario.usuarioId,
    );
  }
}
