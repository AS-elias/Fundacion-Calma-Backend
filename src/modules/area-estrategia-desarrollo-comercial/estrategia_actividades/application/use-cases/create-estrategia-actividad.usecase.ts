import { Injectable } from '@nestjs/common';
import { CreateEstrategiaActividadDto } from '../dto/create-estrategia-actividad.dto';
import { EstrategiaActividadRepository } from '../../domain/repositories/estrategia-actividad.repository';
import { NotificacionSistemaService } from '../../../../notificaciones/application/services/notificacion-sistema.service';

@Injectable()
export class CreateEstrategiaActividadUseCase {
  constructor(
    private readonly repository: EstrategiaActividadRepository,
    private readonly notificacionSistema: NotificacionSistemaService,
  ) {}

  async execute(dto: CreateEstrategiaActividadDto) {
    const created = await this.repository.create(dto);

    await this.notificacionSistema.registrar(
      'Actividad agregada',
      `Se agrego la actividad: ${created.titulo}.`,
      {
        apartado: 'Estrategia Comercial',
        accion: 'Agrego actividad',
        usuarioNombre: dto.creado_por ?? dto.creadoPor,
      },
    );

    return created;
  }
}
