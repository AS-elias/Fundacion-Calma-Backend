import { Injectable } from '@nestjs/common';
import { ComentarioRepository } from '../../domain/repositories/comentario.repository';
import { ConvenioComentario } from '../../domain/entities/comentario.entity';
import { CreateComentarioDto } from '../dto/create-comentario.dto';
import { ConvenioHistorialService } from '../../../convenio_historial/application/services/convenio-historial.service';

@Injectable()
export class CreateComentarioUseCase {
  constructor(
    private readonly comentarioRepository: ComentarioRepository,
    private readonly convenioHistorialService: ConvenioHistorialService,
  ) {}

  async execute(dto: CreateComentarioDto): Promise<ConvenioComentario> {
    const comentario = new ConvenioComentario(
      0,
      dto.convenioId,
      dto.usuarioId,
      dto.comentario,
      new Date(),
    );

    const created = await this.comentarioRepository.create(comentario);

    await this.convenioHistorialService.registrar(
      created.convenioId,
      'COMENTARIO',
      `Comentario agregado: ${created.comentario}`,
      created.usuarioId,
    );

    return created;
  }
}
