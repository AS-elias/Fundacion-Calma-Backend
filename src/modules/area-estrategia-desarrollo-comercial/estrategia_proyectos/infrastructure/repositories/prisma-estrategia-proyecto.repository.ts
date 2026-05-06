import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../infrastructure/prisma/prisma.service';
import { CreateEstrategiaProyectoDto } from '../../application/dto/create-estrategia-proyecto.dto';
import { UpdateEstrategiaProyectoDto } from '../../application/dto/update-estrategia-proyecto.dto';
import { EstrategiaProyecto } from '../../domain/entities/estrategia-proyecto.entity';
import { EstrategiaProyectoFilters } from '../../domain/interfaces/estrategia-proyecto-filters.interface';
import { EstrategiaProyectoRepository } from '../../domain/repositories/estrategia-proyecto.repository';
import {
  date,
  int,
  positiveId,
  proyectoEstado,
  requiredText,
  text,
} from '../../../estrategia_comercial/estrategia-comercial.utils';

@Injectable()
export class PrismaEstrategiaProyectoRepository implements EstrategiaProyectoRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(filters: EstrategiaProyectoFilters): Promise<EstrategiaProyecto[]> {
    const empresaId = int(
      filters.empresaId ?? filters.empresa_id,
      'empresa_id',
    );
    const estado = proyectoEstado(filters.estado);
    const search = text(filters.search);
    const where = {
      ...(empresaId ? { empresa_id: empresaId } : {}),
      ...(estado ? { estado } : {}),
      ...(search
        ? {
            OR: [
              { titulo: { contains: search, mode: 'insensitive' as const } },
              {
                descripcion: {
                  contains: search,
                  mode: 'insensitive' as const,
                },
              },
            ],
          }
        : {}),
    };

    return this.prisma.estrategia_proyectos.findMany({
      where,
      include: { estrategia_proyecto_enlaces: { orderBy: { id: 'asc' } } },
      orderBy: { id: 'asc' },
    }) as unknown as Promise<EstrategiaProyecto[]>;
  }

  findById(id: number): Promise<EstrategiaProyecto | null> {
    return this.prisma.estrategia_proyectos.findUnique({
      where: { id: positiveId(id) },
      include: { estrategia_proyecto_enlaces: { orderBy: { id: 'asc' } } },
    }) as unknown as Promise<EstrategiaProyecto | null>;
  }

  create(data: unknown): Promise<EstrategiaProyecto> {
    const dto = data as CreateEstrategiaProyectoDto;
    const enlaces = Array.isArray(dto.enlaces) ? dto.enlaces : [];

    return this.prisma.estrategia_proyectos.create({
      data: {
        empresa_id: int(dto.empresa_id ?? dto.empresaId, 'empresa_id'),
        titulo: requiredText(dto.titulo, 'titulo'),
        descripcion: text(dto.descripcion),
        estado: proyectoEstado(dto.estado),
        fecha_limite: date(dto.fecha_limite ?? dto.fechaLimite, 'fecha_limite'),
        estrategia_proyecto_enlaces: {
          create: enlaces.map((enlace) => ({
            etiqueta: requiredText(enlace.etiqueta, 'etiqueta'),
            url: requiredText(enlace.url, 'url'),
          })),
        },
      },
      include: { estrategia_proyecto_enlaces: { orderBy: { id: 'asc' } } },
    }) as unknown as Promise<EstrategiaProyecto>;
  }

  update(id: number, data: unknown): Promise<EstrategiaProyecto> {
    const dto = data as UpdateEstrategiaProyectoDto;

    return this.prisma.estrategia_proyectos.update({
      where: { id: positiveId(id) },
      data: {
        empresa_id: int(dto.empresa_id ?? dto.empresaId, 'empresa_id'),
        titulo:
          dto.titulo === undefined
            ? undefined
            : requiredText(dto.titulo, 'titulo'),
        descripcion: text(dto.descripcion),
        estado: proyectoEstado(dto.estado),
        fecha_limite: date(dto.fecha_limite ?? dto.fechaLimite, 'fecha_limite'),
      },
      include: { estrategia_proyecto_enlaces: { orderBy: { id: 'asc' } } },
    }) as unknown as Promise<EstrategiaProyecto>;
  }

  async delete(id: number): Promise<void> {
    await this.prisma.estrategia_proyectos.delete({
      where: { id: positiveId(id) },
    });
  }
}
