import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../infrastructure/prisma/prisma.service';
import { ActividadEnlace } from '../../domain/entities/actividad-enlace.entity';
import { Actividad } from '../../domain/entities/actividad.entity';
import { EstadoActividad } from '../../domain/enums/estado-actividad.enum';
import { ActividadRepository } from '../../domain/repositories/actividad.repository';
import { ActividadFilters } from '../../domain/types/actividad-filters.type';

type ActividadWithEnlaces = Prisma.desarrollo_actividadesGetPayload<{
  include: { actividad_enlaces: true };
}>;

type NormalizedEnlaceInput = {
  nombre_documento: string;
  url: string;
};

@Injectable()
export class PrismaActividadRepository extends ActividadRepository {
  private static readonly DEFAULT_AREA_NAMES = [
    'Desarrollo Comercial',
    'Desarrollo',
  ];

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  private normalizeText(value: unknown): string | undefined {
    if (value === undefined || value === null) {
      return undefined;
    }

    const trimmed = String(value).trim();
    return trimmed === '' ? undefined : trimmed;
  }

  private parsePositiveInt(
    value: unknown,
    fieldName: string,
  ): number | undefined {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      throw new BadRequestException(`${fieldName} debe ser un numero valido.`);
    }

    return parsed;
  }

  private normalizeDate(
    value: unknown,
    fieldName: string,
  ): Date | null | undefined {
    if (value === undefined) {
      return undefined;
    }

    if (value === null || value === '') {
      return null;
    }

    if (value instanceof Date) {
      if (Number.isNaN(value.getTime())) {
        throw new BadRequestException(
          `${fieldName} debe tener un formato valido.`,
        );
      }

      return value;
    }

    const trimmed = String(value).trim();
    if (!trimmed) {
      return null;
    }

    const ddmmyyyyMatch = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (ddmmyyyyMatch) {
      const [, day, month, year] = ddmmyyyyMatch;
      const parsed = new Date(`${year}-${month}-${day}T00:00:00`);

      if (Number.isNaN(parsed.getTime())) {
        throw new BadRequestException(
          `${fieldName} debe tener un formato valido.`,
        );
      }

      return parsed;
    }

    const parsed = new Date(trimmed);
    if (Number.isNaN(parsed.getTime())) {
      throw new BadRequestException(
        `${fieldName} debe tener un formato valido.`,
      );
    }

    return parsed;
  }

  private normalizeEstado(value: unknown): EstadoActividad | undefined {
    const normalizedValue = this.normalizeText(value);

    if (normalizedValue === undefined) {
      return undefined;
    }

    const normalizedKey = normalizedValue
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (normalizedKey === 'PENDIENTE') {
      return EstadoActividad.PENDIENTE;
    }

    if (normalizedKey === 'EN PROCESO') {
      return EstadoActividad.EN_PROCESO;
    }

    if (normalizedKey === 'COMPLETADO') {
      return EstadoActividad.COMPLETADO;
    }

    if (normalizedKey === 'PARALIZADO') {
      return EstadoActividad.PARALIZADO;
    }

    throw new BadRequestException(
      'estado debe ser PENDIENTE, EN PROCESO, COMPLETADO o PARALIZADO.',
    );
  }

  private normalizeUrl(value: unknown): string {
    const normalizedValue = this.normalizeText(value);

    if (!normalizedValue) {
      throw new BadRequestException('La URL del enlace es obligatoria.');
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(normalizedValue);
    } catch {
      throw new BadRequestException(
        'Cada enlace debe tener una URL valida con http o https.',
      );
    }

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new BadRequestException(
        'Cada enlace debe tener una URL valida con http o https.',
      );
    }

    return parsedUrl.toString();
  }

  private normalizeEnlaces(
    enlaces: ActividadEnlace[] | unknown,
  ): NormalizedEnlaceInput[] | undefined {
    if (enlaces === undefined) {
      return undefined;
    }

    if (!Array.isArray(enlaces)) {
      throw new BadRequestException('enlaces debe ser un arreglo.');
    }

    return enlaces
      .map((enlace, index) => {
        const nombreDocumento = this.normalizeText(
          (enlace as { nombreDocumento?: unknown })?.nombreDocumento,
        );
        const urlRaw = (enlace as { url?: unknown })?.url;
        const urlText = this.normalizeText(urlRaw);

        if (!nombreDocumento && !urlText) {
          return null;
        }

        if (!nombreDocumento) {
          throw new BadRequestException(
            `El enlace ${index + 1} debe incluir nombreDocumento.`,
          );
        }

        if (!urlText) {
          throw new BadRequestException(
            `El enlace ${index + 1} debe incluir una URL valida.`,
          );
        }

        return {
          nombre_documento: nombreDocumento,
          url: this.normalizeUrl(urlText),
        };
      })
      .filter((enlace): enlace is NormalizedEnlaceInput => enlace !== null);
  }

  private async findDefaultAreaId(): Promise<number | undefined> {
    for (const areaName of PrismaActividadRepository.DEFAULT_AREA_NAMES) {
      const area = await this.prisma.areas.findFirst({
        where: { nombre: areaName },
        select: { id: true },
        orderBy: { id: 'asc' },
      });

      if (area) {
        return area.id;
      }
    }

    return undefined;
  }

  private async resolveAreaId(
    value: unknown,
    fallbackAreaId?: number,
  ): Promise<number> {
    const explicitAreaId = this.parsePositiveInt(value, 'areaId');

    if (explicitAreaId !== undefined) {
      const area = await this.prisma.areas.findUnique({
        where: { id: explicitAreaId },
        select: { id: true },
      });

      if (!area) {
        throw new BadRequestException('El area indicada no existe.');
      }

      return area.id;
    }

    if (fallbackAreaId !== undefined) {
      return fallbackAreaId;
    }

    const defaultAreaId = await this.findDefaultAreaId();

    if (defaultAreaId === undefined) {
      throw new BadRequestException(
        'No se pudo determinar el area de Desarrollo Comercial.',
      );
    }

    return defaultAreaId;
  }

  private mapToEntity(actividad: ActividadWithEnlaces): Actividad {
    return new Actividad(
      actividad.id,
      actividad.area_id as number,
      actividad.titulo,
      actividad.descripcion ?? null,
      this.normalizeEstado(actividad.estado) ?? EstadoActividad.PENDIENTE,
      actividad.fecha_limite ?? null,
      actividad.creador_id ?? null,
      actividad.fecha_creacion ?? new Date(),
      actividad.actividad_enlaces.map(
        (enlace) =>
          new ActividadEnlace(
            enlace.id,
            enlace.nombre_documento,
            enlace.url,
            enlace.fecha_creacion ?? new Date(),
          ),
      ),
    );
  }

  async create(actividad: Actividad): Promise<Actividad> {
    const titulo = this.normalizeText(actividad.titulo);
    if (!titulo) {
      throw new BadRequestException('titulo es obligatorio.');
    }

    const created = await this.prisma.desarrollo_actividades.create({
      data: {
        area_id: await this.resolveAreaId(actividad.areaId),
        titulo,
        descripcion: this.normalizeText(actividad.descripcion) ?? null,
        estado:
          this.normalizeEstado(actividad.estado) ?? EstadoActividad.PENDIENTE,
        fecha_limite:
          this.normalizeDate(actividad.fechaLimite, 'fechaLimite') ?? null,
        creador_id: this.parsePositiveInt(actividad.creadorId, 'creadorId'),
        actividad_enlaces: {
          create:
            this.normalizeEnlaces(actividad.enlaces)?.map((enlace) => ({
              nombre_documento: enlace.nombre_documento,
              url: enlace.url,
            })) ?? [],
        },
      },
      include: {
        actividad_enlaces: {
          orderBy: { fecha_creacion: 'asc' },
        },
      },
    });

    return this.mapToEntity(created);
  }

  async findAll(filters?: ActividadFilters): Promise<Actividad[]> {
    const normalizedEstado = this.normalizeText(filters?.estado);
    const normalizedSearch = this.normalizeText(filters?.search);
    const where: Prisma.desarrollo_actividadesWhereInput = {};

    if (normalizedEstado && normalizedEstado.toUpperCase() !== 'TODOS') {
      where.estado = this.normalizeEstado(normalizedEstado);
    }

    if (normalizedSearch) {
      where.OR = [
        {
          titulo: {
            contains: normalizedSearch,
            mode: 'insensitive',
          },
        },
        {
          descripcion: {
            contains: normalizedSearch,
            mode: 'insensitive',
          },
        },
      ];
    }

    const actividades = await this.prisma.desarrollo_actividades.findMany({
      where,
      include: {
        actividad_enlaces: {
          orderBy: { fecha_creacion: 'asc' },
        },
      },
      orderBy: [{ fecha_limite: 'asc' }, { fecha_creacion: 'desc' }],
    });

    return actividades.map((actividad) => this.mapToEntity(actividad));
  }

  async findById(id: number): Promise<Actividad | null> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestException('El id de la actividad es invalido.');
    }

    const actividad = await this.prisma.desarrollo_actividades.findUnique({
      where: { id },
      include: {
        actividad_enlaces: {
          orderBy: { fecha_creacion: 'asc' },
        },
      },
    });

    if (!actividad) {
      return null;
    }

    return this.mapToEntity(actividad);
  }

  async update(
    id: number,
    actividadData: Partial<Actividad>,
  ): Promise<Actividad> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestException('El id de la actividad es invalido.');
    }

    const existingActividad =
      await this.prisma.desarrollo_actividades.findUnique({
        where: { id },
        select: { id: true, area_id: true },
      });

    if (!existingActividad) {
      throw new NotFoundException('La actividad no existe.');
    }

    const titulo =
      actividadData.titulo !== undefined
        ? this.normalizeText(actividadData.titulo)
        : undefined;

    if (actividadData.titulo !== undefined && !titulo) {
      throw new BadRequestException('titulo es obligatorio.');
    }

    const enlaces = this.normalizeEnlaces(actividadData.enlaces);

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.desarrollo_actividades.update({
        where: { id },
        data: {
          area_id: await this.resolveAreaId(
            actividadData.areaId,
            existingActividad.area_id ?? undefined,
          ),
          titulo,
          descripcion:
            actividadData.descripcion === undefined
              ? undefined
              : (this.normalizeText(actividadData.descripcion) ?? null),
          estado:
            actividadData.estado === undefined
              ? undefined
              : this.normalizeEstado(actividadData.estado),
          fecha_limite: this.normalizeDate(
            actividadData.fechaLimite,
            'fechaLimite',
          ),
          creador_id:
            actividadData.creadorId === undefined
              ? undefined
              : (this.parsePositiveInt(actividadData.creadorId, 'creadorId') ??
                null),
        },
      });

      if (enlaces !== undefined) {
        await tx.actividad_enlaces.deleteMany({
          where: { actividad_id: id },
        });

        if (enlaces.length > 0) {
          await tx.actividad_enlaces.createMany({
            data: enlaces.map((enlace) => ({
              actividad_id: id,
              nombre_documento: enlace.nombre_documento,
              url: enlace.url,
            })),
          });
        }
      }

      return tx.desarrollo_actividades.findUnique({
        where: { id },
        include: {
          actividad_enlaces: {
            orderBy: { fecha_creacion: 'asc' },
          },
        },
      });
    });

    if (!updated) {
      throw new NotFoundException('La actividad no existe.');
    }

    return this.mapToEntity(updated);
  }
}
