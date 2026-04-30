import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../infrastructure/prisma/prisma.service';
import { CreateEstrategiaActividadDto } from '../../application/dto/create-estrategia-actividad.dto';
import { UpdateEstrategiaActividadDto } from '../../application/dto/update-estrategia-actividad.dto';
import { EstrategiaActividad } from '../../domain/entities/estrategia-actividad.entity';
import { EstrategiaActividadFilters } from '../../domain/interfaces/estrategia-actividad-filters.interface';
import { EstrategiaActividadRepository } from '../../domain/repositories/estrategia-actividad.repository';
import {
  actividadEstado,
  date,
  positiveId,
  prioridad,
  requiredText,
  text,
} from '../../../estrategia_comercial/estrategia-comercial.utils';

@Injectable()
export class PrismaEstrategiaActividadRepository implements EstrategiaActividadRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(filters: EstrategiaActividadFilters): Promise<EstrategiaActividad[]> {
    const parsedEstado = actividadEstado(filters.estado);
    const parsedSearch = text(filters.search);
    const where = {
      ...(parsedEstado ? { estado: parsedEstado } : {}),
      ...(parsedSearch
        ? {
            OR: [
              {
                titulo: {
                  contains: parsedSearch,
                  mode: 'insensitive' as const,
                },
              },
              {
                descripcion: {
                  contains: parsedSearch,
                  mode: 'insensitive' as const,
                },
              },
              {
                creado_por: {
                  contains: parsedSearch,
                  mode: 'insensitive' as const,
                },
              },
            ],
          }
        : {}),
    };

    return this.prisma.estrategia_actividades.findMany({
      where,
      include: { estrategia_actividad_enlaces: { orderBy: { id: 'asc' } } },
      orderBy: { id: 'asc' },
    }) as unknown as Promise<EstrategiaActividad[]>;
  }

  findById(id: number): Promise<EstrategiaActividad | null> {
    return this.prisma.estrategia_actividades.findUnique({
      where: { id: positiveId(id) },
      include: { estrategia_actividad_enlaces: { orderBy: { id: 'asc' } } },
    }) as unknown as Promise<EstrategiaActividad | null>;
  }

  create(data: unknown): Promise<EstrategiaActividad> {
    const dto = data as CreateEstrategiaActividadDto;
    const enlaces = Array.isArray(dto.enlaces) ? dto.enlaces : [];

    return this.prisma.estrategia_actividades.create({
      data: {
        titulo: requiredText(dto.titulo, 'titulo'),
        descripcion: text(dto.descripcion),
        estado: actividadEstado(dto.estado),
        creado_por: text(dto.creado_por ?? dto.creadoPor),
        prioridad: prioridad(dto.prioridad),
        fecha_creacion: date(
          dto.fecha_creacion ?? dto.fechaCreacion,
          'fecha_creacion',
        ),
        fecha_limite: date(dto.fecha_limite ?? dto.fechaLimite, 'fecha_limite'),
        estrategia_actividad_enlaces: {
          create: enlaces.map((enlace) => ({
            nombre: requiredText(enlace.nombre, 'nombre'),
            url: requiredText(enlace.url, 'url'),
          })),
        },
      },
      include: { estrategia_actividad_enlaces: { orderBy: { id: 'asc' } } },
    }) as unknown as Promise<EstrategiaActividad>;
  }

  update(id: number, data: unknown): Promise<EstrategiaActividad> {
    const dto = data as UpdateEstrategiaActividadDto;

    return this.prisma.estrategia_actividades.update({
      where: { id: positiveId(id) },
      data: {
        titulo:
          dto.titulo === undefined
            ? undefined
            : requiredText(dto.titulo, 'titulo'),
        descripcion: text(dto.descripcion),
        estado: actividadEstado(dto.estado),
        creado_por: text(dto.creado_por ?? dto.creadoPor),
        prioridad: prioridad(dto.prioridad),
        fecha_creacion: date(
          dto.fecha_creacion ?? dto.fechaCreacion,
          'fecha_creacion',
        ),
        fecha_limite: date(dto.fecha_limite ?? dto.fechaLimite, 'fecha_limite'),
      },
      include: { estrategia_actividad_enlaces: { orderBy: { id: 'asc' } } },
    }) as unknown as Promise<EstrategiaActividad>;
  }

  async delete(id: number): Promise<void> {
    await this.prisma.estrategia_actividades.delete({
      where: { id: positiveId(id) },
    });
  }
}
