import { Injectable } from '@nestjs/common';
import { UpdateAnalisisTareaDto } from '../dto/update-analisis-tarea.dto';
import { AnalisisTareaRepository } from '../../domain/repositories/analisis-tarea.repository';
import { AnalisisTarea } from '../../domain/entities/analisis-tarea.entity';
import { NotificacionSistemaService } from '../../../../notificaciones/application/services/notificacion-sistema.service';

@Injectable()
export class UpdateAnalisisTareaUseCase {
  constructor(
    private readonly repository: AnalisisTareaRepository,
    private readonly notificacionSistema: NotificacionSistemaService,
  ) {}

  async execute(id: number, dto: UpdateAnalisisTareaDto) {
    const anterior = await this.repository.findById(id);
    const updated = await this.repository.update(id, dto);
    const cambios = this.obtenerCambios(anterior, updated, dto);
    const detalleCambios = cambios.length
      ? `\nCambios realizados:\n${cambios.map((cambio) => `- ${cambio}`).join('\n')}`
      : '';

    await this.notificacionSistema.registrar(
      'Tarea editada',
      `Se edito la tarea: ${updated.titulo}.${detalleCambios}`,
      {
        apartado: 'Analisis de Datos',
        accion: 'Edito tarea',
        usuarioId: this.numero(dto.creador_id ?? dto.creadorId ?? updated.creador_id),
      },
    );

    return updated;
  }

  private obtenerCambios(
    anterior: AnalisisTarea | null,
    actual: AnalisisTarea,
    dto: UpdateAnalisisTareaDto,
  ): string[] {
    if (!anterior) {
      return [];
    }

    const cambios: string[] = [];

    this.agregarCambio(cambios, 'titulo', anterior.titulo, actual.titulo, dto.titulo);
    this.agregarCambio(cambios, 'subtitulo', anterior.subtitulo, actual.subtitulo, dto.subtitulo);
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

  private numero(valor: unknown): number | undefined {
    const parsed = Number(valor);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
  }
}
