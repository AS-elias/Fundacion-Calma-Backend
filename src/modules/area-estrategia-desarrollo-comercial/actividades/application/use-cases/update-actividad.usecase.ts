import { Injectable } from '@nestjs/common';
import { ActividadEnlace } from '../../domain/entities/actividad-enlace.entity';
import { Actividad } from '../../domain/entities/actividad.entity';
import { EstadoActividad } from '../../domain/enums/estado-actividad.enum';
import { ActividadRepository } from '../../domain/repositories/actividad.repository';
import { UpdateActividadDto } from '../dto/update-actividad.dto';
import { NotificacionSistemaService } from '../../../../notificaciones/application/services/notificacion-sistema.service';

@Injectable()
export class UpdateActividadUseCase {
  constructor(
    private readonly actividadRepository: ActividadRepository,
    private readonly notificacionSistema: NotificacionSistemaService,
  ) {}

  async execute(id: number, dto: UpdateActividadDto): Promise<Actividad> {
    const anterior = await this.actividadRepository.findById(id);
    const actividadData: Partial<Actividad> = {
      areaId: dto.areaId,
      titulo: dto.titulo,
      descripcion: dto.descripcion,
      estado: dto.estado as EstadoActividad | undefined,
      fechaLimite: dto.fechaLimite as Date | null | undefined,
      creadorId: dto.creadorId,
      enlaces: dto.enlaces?.map(
        (enlace) =>
          new ActividadEnlace(
            0,
            enlace.nombreDocumento,
            enlace.url,
            new Date(),
          ),
      ),
    };

    const updated = await this.actividadRepository.update(id, actividadData);
    const cambios = this.obtenerCambios(anterior, updated, dto);
    const detalleCambios = cambios.length
      ? `\nCambios realizados:\n${cambios.map((cambio) => `- ${cambio}`).join('\n')}`
      : '';

    await this.notificacionSistema.registrar(
      'Actividad editada',
      `Se edito la actividad: ${updated.titulo}.${detalleCambios}`,
      {
        apartado: 'Desarrollo Comercial',
        accion: 'Edito actividad',
        usuarioId: dto.creadorId ?? updated.creadorId,
      },
    );

    return updated;
  }

  private obtenerCambios(
    anterior: Actividad | null,
    actual: Actividad,
    dto: UpdateActividadDto,
  ): string[] {
    if (!anterior) {
      return [];
    }

    const cambios: string[] = [];

    this.agregarCambio(cambios, 'titulo', anterior.titulo, actual.titulo, dto.titulo);
    this.agregarCambio(
      cambios,
      'descripcion',
      anterior.descripcion,
      actual.descripcion,
      dto.descripcion,
    );
    this.agregarCambio(cambios, 'estado', anterior.estado, actual.estado, dto.estado);
    this.agregarCambio(
      cambios,
      'fecha limite',
      this.formatearFecha(anterior.fechaLimite),
      this.formatearFecha(actual.fechaLimite),
      dto.fechaLimite,
    );

    if (dto.enlaces !== undefined && this.enlacesCambiaron(anterior, actual)) {
      cambios.push('enlaces actualizados');
    }

    return cambios;
  }

  private agregarCambio(
    cambios: string[],
    campo: string,
    anterior: unknown,
    actual: unknown,
    valorEnviado: unknown,
  ): void {
    if (valorEnviado === undefined) {
      return;
    }

    const antes = this.normalizarValor(anterior);
    const despues = this.normalizarValor(actual);

    if (antes !== despues) {
      cambios.push(`${campo} de "${antes || 'Sin dato'}" a "${despues || 'Sin dato'}"`);
    }
  }

  private enlacesCambiaron(anterior: Actividad, actual: Actividad): boolean {
    const serializar = (actividad: Actividad) =>
      JSON.stringify(
        (actividad.enlaces ?? []).map((enlace) => ({
          nombre: enlace.nombreDocumento,
          url: enlace.url,
        })),
      );

    return serializar(anterior) !== serializar(actual);
  }

  private normalizarValor(valor: unknown): string {
    if (valor === null || valor === undefined) {
      return '';
    }

    return String(valor).trim();
  }

  private formatearFecha(fecha: Date | string | null | undefined): string {
    if (!fecha) {
      return '';
    }

    const date = fecha instanceof Date ? fecha : new Date(fecha);

    if (Number.isNaN(date.getTime())) {
      return String(fecha);
    }

    const dia = String(date.getUTCDate()).padStart(2, '0');
    const mes = String(date.getUTCMonth() + 1).padStart(2, '0');
    const anio = date.getUTCFullYear();

    return `${dia}/${mes}/${anio}`;
  }
}
