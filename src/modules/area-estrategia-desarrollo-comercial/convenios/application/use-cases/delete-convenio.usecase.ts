import { Injectable } from '@nestjs/common';
import { ConvenioRepository } from '../../domain/repositories/convenio.repository';
import { NotificacionSistemaService } from '../../../../notificaciones/application/services/notificacion-sistema.service';

@Injectable()
export class DeleteConvenioUseCase {
  constructor(
    private readonly convenioRepository: ConvenioRepository,
    private readonly notificacionSistema: NotificacionSistemaService,
  ) {}

  async execute(
    id: number,
    usuarioId?: number,
    usuarioNombre?: string,
  ): Promise<void> {
    const convenio = await this.convenioRepository.findById(id);

    await this.convenioRepository.delete(id);

    await this.notificacionSistema.registrar(
      'Convenio eliminado',
      `Se elimino el convenio${convenio ? ` con ${convenio.entidadNombre}` : ''}.`,
      {
        apartado: 'Convenios',
        accion: 'Elimino convenio',
        usuarioId: usuarioId ?? convenio?.creadorId,
        usuarioNombre,
      },
    );
  }
}
