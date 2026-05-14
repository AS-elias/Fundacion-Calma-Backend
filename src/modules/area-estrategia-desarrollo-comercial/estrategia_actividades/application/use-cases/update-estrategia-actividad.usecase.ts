import { Injectable } from '@nestjs/common';
import { UpdateEstrategiaActividadDto } from '../dto/update-estrategia-actividad.dto';
import { EstrategiaActividadRepository } from '../../domain/repositories/estrategia-actividad.repository';
import { NotificacionSistemaService } from '../../../../notificaciones/application/services/notificacion-sistema.service';

@Injectable()
export class UpdateEstrategiaActividadUseCase {
  constructor(
    private readonly repository: EstrategiaActividadRepository,
    private readonly notificacionSistema: NotificacionSistemaService,
  ) {}

  async execute(
    id: number,
    dto: UpdateEstrategiaActividadDto,
    usuarioNombre?: string,
  ) {
    const anterior = await this.repository.findById(id);
    const updated = await this.repository.update(id, dto);
    const cambios = this.obtenerCambios(anterior, updated, dto);
    const detalleCambios = cambios.length
      ? `\nCambios realizados:\n${cambios.map((cambio) => `- ${cambio}`).join('\n')}`
      : '';

    await this.notificacionSistema.registrar(
      'Actividad editada',
      `Se edito la actividad: ${updated.titulo}.${detalleCambios}`,
      {
        apartado: 'Estrategia Comercial',
        accion: 'Edito actividad',
        usuarioNombre: usuarioNombre ?? dto.creado_por ?? dto.creadoPor,
      },
    );

    return updated;
  }

  private obtenerCambios(
    anterior: any,
    actual: any,
    dto: UpdateEstrategiaActividadDto,
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
      'responsable',
      anterior.creado_por,
      actual.creado_por,
      dto.creado_por ?? dto.creadoPor,
    );
    this.agregarCambio(cambios, 'prioridad', anterior.prioridad, actual.prioridad, dto.prioridad);
    this.agregarCambio(
      cambios,
      'fecha limite',
      this.formatearFecha(anterior.fecha_limite),
      this.formatearFecha(actual.fecha_limite),
      dto.fecha_limite ?? dto.fechaLimite,
    );

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

    const antes = this.formatearTexto(anterior);
    const despues = this.formatearTexto(actual);

    if (antes !== despues) {
      cambios.push(`${campo} de "${antes || 'Sin dato'}" a "${despues || 'Sin dato'}"`);
    }
  }

  private formatearTexto(valor: unknown): string {
    if (valor === null || valor === undefined) {
      return '';
    }

    return String(valor).replace(/_/g, ' ').trim();
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
