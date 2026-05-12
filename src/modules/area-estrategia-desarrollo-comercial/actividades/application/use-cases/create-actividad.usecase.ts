import { Injectable } from '@nestjs/common';
import { CreateActividadDto } from '../dto/create-actividad.dto';
import { Actividad } from '../../domain/entities/actividad.entity';
import { ActividadEnlace } from '../../domain/entities/actividad-enlace.entity';
import { EstadoActividad } from '../../domain/enums/estado-actividad.enum';
import { ActividadRepository } from '../../domain/repositories/actividad.repository';
import { NotificacionSistemaService } from '../../../../notificaciones/application/services/notificacion-sistema.service';

@Injectable()
export class CreateActividadUseCase {
  constructor(
    private readonly actividadRepository: ActividadRepository,
    private readonly notificacionSistema: NotificacionSistemaService,
  ) {}

  async execute(dto: CreateActividadDto): Promise<Actividad> {
    const actividad = new Actividad(
      0,
      dto.areaId ?? 0,
      dto.titulo,
      dto.descripcion ?? null,
      EstadoActividad.PENDIENTE,
      (dto.fechaLimite as Date | null | undefined) ?? null,
      dto.creadorId ?? null,
      new Date(),
      (dto.enlaces ?? []).map(
        (enlace) =>
          new ActividadEnlace(
            0,
            enlace.nombreDocumento,
            enlace.url,
            new Date(),
          ),
      ),
    );

    if (dto.estado !== undefined) {
      actividad.estado = dto.estado as EstadoActividad;
    }

    const created = await this.actividadRepository.create(actividad);

    await this.notificacionSistema.registrar(
      'Actividad agregada',
      `Se agrego la actividad: ${created.titulo}.`,
      {
        apartado: 'Desarrollo Comercial',
        accion: 'Agrego actividad',
        usuarioId: created.creadorId,
      },
    );

    return created;
  }
}
