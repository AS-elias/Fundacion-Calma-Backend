import { Injectable } from '@nestjs/common';
import { EstrategiaActividadRepository } from '../../domain/repositories/estrategia-actividad.repository';
import { NotificacionSistemaService } from '../../../../notificaciones/application/services/notificacion-sistema.service';

@Injectable()
export class DeleteEstrategiaActividadUseCase {
  constructor(
    private readonly repository: EstrategiaActividadRepository,
    private readonly notificacionSistema: NotificacionSistemaService,
  ) {}

  async execute(id: number, usuarioNombre?: string) {
    const actividad = await this.repository.findById(id);

    await this.repository.delete(id);

    await this.notificacionSistema.registrar(
      'Actividad eliminada',
      `Se elimino la actividad${actividad ? `: ${actividad.titulo}` : ''}.`,
      {
        apartado: 'Estrategia Comercial',
        accion: 'Elimino actividad',
        usuarioNombre: usuarioNombre ?? actividad?.creado_por,
      },
    );

    return { message: 'Actividad eliminada exitosamente.' };
  }
}
