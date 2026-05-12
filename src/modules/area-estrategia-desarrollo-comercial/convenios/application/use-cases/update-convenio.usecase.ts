import { Injectable } from '@nestjs/common';
import { ConvenioRepository } from '../../domain/repositories/convenio.repository';
import { Convenio } from '../../domain/entities/convenio.entity';
import { UpdateConvenioDto } from '../dto/update-convenio.dto';
import { ConvenioHistorialService } from '../../../convenio_historial/application/services/convenio-historial.service';
import { NotificacionSistemaService } from '../../../../notificaciones/application/services/notificacion-sistema.service';

@Injectable()
export class UpdateConvenioUseCase {
  constructor(
    private readonly convenioRepository: ConvenioRepository,
    private readonly convenioHistorialService: ConvenioHistorialService,
    private readonly notificacionSistema: NotificacionSistemaService,
  ) {}

  async execute(id: number, dto: UpdateConvenioDto): Promise<Convenio> {
    const anterior = await this.convenioRepository.findById(id);
    const updated = await this.convenioRepository.update(id, dto);
    const cambios = this.obtenerCambios(anterior, updated, dto);
    const detalleCambios = cambios.length
      ? `\nCambios realizados:\n${cambios.map((cambio) => `- ${cambio}`).join('\n')}`
      : '';

    await this.convenioHistorialService.registrar(
      updated.id,
      'ACTUALIZACION',
      this.construirDescripcionHistorial(cambios),
      dto.usuarioId ?? dto.creadorId ?? updated.creadorId,
    );

    await this.notificacionSistema.registrar(
      'Convenio editado',
      `Se edito el convenio: ${updated.entidadNombre}.${detalleCambios}`,
      {
        apartado: 'Convenios',
        accion: 'Edito convenio',
        usuarioId: dto.usuarioId ?? dto.creadorId ?? updated.creadorId,
        usuarioNombre: dto.usuarioNombre,
      },
    );

    return updated;
  }

  private construirDescripcionHistorial(cambios: string[]): string {
    if (!cambios.length) {
      return 'Convenio actualizado sin cambios visibles.';
    }

    return [
      'Cambios realizados:',
      ...cambios.map((cambio) => `- ${cambio}.`),
    ].join('\n');
  }

  private obtenerCambios(
    anterior: Convenio | null,
    actual: Convenio,
    dto: UpdateConvenioDto,
  ): string[] {
    if (!anterior) {
      return [];
    }

    const cambios: string[] = [];

    this.agregarCambio(cambios, 'nombre', anterior.entidadNombre, actual.entidadNombre, dto.entidadNombre);
    this.agregarCambio(cambios, 'logo', anterior.logoUrl, actual.logoUrl, dto.logoUrl);
    this.agregarCambio(cambios, 'RUC', anterior.ruc, actual.ruc, dto.ruc);
    this.agregarCambio(cambios, 'rubro', anterior.rubro, actual.rubro, dto.rubro);
    this.agregarCambio(cambios, 'contacto', anterior.contactoNombre, actual.contactoNombre, dto.contactoNombre);
    this.agregarCambio(cambios, 'telefono', anterior.telefonoContacto, actual.telefonoContacto, dto.telefonoContacto);
    this.agregarCambio(cambios, 'estado', anterior.estado, actual.estado, dto.estado);
    this.agregarCambio(cambios, 'tipo', anterior.tipo, actual.tipo, dto.tipo);
    this.agregarCambio(cambios, 'conexion', anterior.conexion, actual.conexion, dto.conexion);
    this.agregarCambio(
      cambios,
      'fecha de expiracion',
      this.formatearFecha(anterior.fechaExpiracion),
      this.formatearFecha(actual.fechaExpiracion),
      dto.fechaExpiracion,
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
