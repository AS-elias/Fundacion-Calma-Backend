import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../infrastructure/prisma/prisma.service';
import { Convenio } from '../../domain/entities/convenio.entity';
import { ConexionConvenio } from '../../domain/enums/conexion-convenio.enum';
import { EstadoConvenio } from '../../domain/enums/estado-convenio.enum';
import { TipoConvenio } from '../../domain/enums/tipo-convenio.enum';
import { ConvenioRepository } from '../../domain/repositories/convenio.repository';

@Injectable()
export class PrismaConvenioRepository implements ConvenioRepository {
  private static readonly DEFAULT_AREA_NAME = 'Área Comercial';

  constructor(private readonly prisma: PrismaService) {}

  private normalizeText(value: unknown): string | undefined {
    if (value === undefined || value === null) {
      return undefined;
    }

    const trimmed = String(value).trim();
    return trimmed === '' ? undefined : trimmed;
  }

  private normalizeDate(value: unknown): Date | undefined {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    if (value instanceof Date) {
      return Number.isNaN(value.getTime()) ? undefined : value;
    }

    const trimmed = String(value).trim();
    if (!trimmed) {
      return undefined;
    }

    const ddmmyyyyMatch = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (ddmmyyyyMatch) {
      const [, day, month, year] = ddmmyyyyMatch;
      const parsed = new Date(`${year}-${month}-${day}T00:00:00`);
      if (Number.isNaN(parsed.getTime())) {
        throw new BadRequestException(
          'fechaExpiracion debe tener un formato valido.',
        );
      }

      return parsed;
    }

    const parsed = new Date(trimmed);
    if (Number.isNaN(parsed.getTime())) {
      throw new BadRequestException(
        'fechaExpiracion debe tener un formato valido.',
      );
    }

    return parsed;
  }

  private parseAreaId(value: unknown): number | undefined {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      return undefined;
    }

    return parsed;
  }

  private async findDefaultAreaId(): Promise<number | undefined> {
    const area = await this.prisma.areas.findFirst({
      where: { nombre: PrismaConvenioRepository.DEFAULT_AREA_NAME },
      select: { id: true },
      orderBy: { id: 'asc' },
    });

    return area?.id;
  }

  private async resolveAreaId(
    value: unknown,
    fallbackAreaId?: number,
  ): Promise<number | undefined> {
    const parsedAreaId = this.parseAreaId(value);

    if (parsedAreaId !== undefined) {
      const area = await this.prisma.areas.findUnique({
        where: { id: parsedAreaId },
        select: { id: true },
      });

      if (area) {
        return area.id;
      }
    }

    if (fallbackAreaId !== undefined) {
      return fallbackAreaId;
    }

    return this.findDefaultAreaId();
  }

  async create(convenio: Convenio): Promise<Convenio> {
    const fechaExpiracion = this.normalizeDate(convenio.fechaExpiracion);
    const areaId = await this.resolveAreaId(convenio.areaId);

    if (areaId === undefined) {
      throw new BadRequestException(
        'No se pudo determinar un area valida para el convenio.',
      );
    }

    const created = await this.prisma.convenios.create({
      data: {
        area_id: areaId,
        entidad_nombre:
          this.normalizeText(convenio.entidadNombre) ?? convenio.entidadNombre,
        logo_url: this.normalizeText(convenio.logoUrl),
        ruc: this.normalizeText(convenio.ruc),
        rubro: this.normalizeText(convenio.rubro),
        contacto_nombre: this.normalizeText(convenio.contactoNombre),
        telefono_contacto: this.normalizeText(convenio.telefonoContacto),
        estado: this.normalizeText(convenio.estado),
        tipo: this.normalizeText(convenio.tipo),
        conexion: this.normalizeText(convenio.conexion),
        fecha_expiracion: fechaExpiracion ?? null,
        creador_id: convenio.creadorId,
      },
    });

    return new Convenio(
      created.id,
      created.area_id as number,
      created.entidad_nombre,
      created.logo_url,
      created.ruc ?? '',
      created.rubro ?? '',
      created.contacto_nombre ?? '',
      created.telefono_contacto ?? '',
      (created.estado as EstadoConvenio) ?? convenio.estado ?? null,
      (created.tipo as TipoConvenio) ?? convenio.tipo ?? null,
      (created.conexion as ConexionConvenio) ?? convenio.conexion ?? null,
      created.fecha_expiracion ?? new Date(),
      created.creador_id as number,
      created.fecha_creacion ?? new Date(),
    );
  }

  async findAll(): Promise<Convenio[]> {
    const convenios = await this.prisma.convenios.findMany();

    return convenios.map(
      (c) =>
        new Convenio(
          c.id,
          c.area_id as number,
          c.entidad_nombre,
          c.logo_url,
          c.ruc ?? '',
          c.rubro ?? '',
          c.contacto_nombre ?? '',
          c.telefono_contacto ?? '',
          (c.estado as EstadoConvenio) ?? null,
          (c.tipo as TipoConvenio) ?? null,
          (c.conexion as ConexionConvenio) ?? null,
          c.fecha_expiracion ?? new Date(),
          c.creador_id as number,
          c.fecha_creacion ?? new Date(),
        ),
    );
  }

  async findById(id: number): Promise<Convenio | null> {
    const convenio = await this.prisma.convenios.findUnique({
      where: { id },
    });

    if (!convenio) return null;

    return new Convenio(
      convenio.id,
      convenio.area_id as number,
      convenio.entidad_nombre,
      convenio.logo_url,
      convenio.ruc ?? '',
      convenio.rubro ?? '',
      convenio.contacto_nombre ?? '',
      convenio.telefono_contacto ?? '',
      (convenio.estado as EstadoConvenio) ?? null,
      (convenio.tipo as TipoConvenio) ?? null,
      (convenio.conexion as ConexionConvenio) ?? null,
      convenio.fecha_expiracion ?? new Date(),
      convenio.creador_id as number,
      convenio.fecha_creacion ?? new Date(),
    );
  }

  async update(id: number, convenioData: Partial<Convenio>): Promise<Convenio> {
    const fechaExpiracion = this.normalizeDate(
      convenioData.fechaExpiracion as Date | string | undefined,
    );
    const existingConvenio = await this.prisma.convenios.findUnique({
      where: { id },
      select: { area_id: true },
    });

    if (!existingConvenio) {
      throw new BadRequestException('El convenio no existe.');
    }

    const areaId = await this.resolveAreaId(
      convenioData.areaId,
      existingConvenio.area_id ?? undefined,
    );

    const updated = await this.prisma.convenios.update({
      where: { id },
      data: {
        area_id: areaId,
        entidad_nombre: this.normalizeText(convenioData.entidadNombre),
        logo_url: this.normalizeText(convenioData.logoUrl),
        ruc: this.normalizeText(convenioData.ruc),
        rubro: this.normalizeText(convenioData.rubro),
        contacto_nombre: this.normalizeText(convenioData.contactoNombre),
        telefono_contacto: this.normalizeText(convenioData.telefonoContacto),
        estado: this.normalizeText(convenioData.estado),
        tipo: this.normalizeText(convenioData.tipo),
        conexion: this.normalizeText(convenioData.conexion),
        fecha_expiracion: fechaExpiracion,
      },
    });

    return new Convenio(
      updated.id,
      updated.area_id as number,
      updated.entidad_nombre,
      updated.logo_url,
      updated.ruc ?? '',
      updated.rubro ?? '',
      updated.contacto_nombre ?? '',
      updated.telefono_contacto ?? '',
      (updated.estado as EstadoConvenio) ?? convenioData.estado ?? null,
      (updated.tipo as TipoConvenio) ?? convenioData.tipo ?? null,
      (updated.conexion as ConexionConvenio) ?? convenioData.conexion ?? null,
      updated.fecha_expiracion ?? new Date(),
      updated.creador_id as number,
      updated.fecha_creacion ?? new Date(),
    );
  }

  async delete(id: number): Promise<void> {
    await this.prisma.convenios.delete({
      where: { id },
    });
  }
}
