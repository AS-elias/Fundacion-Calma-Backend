import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../infrastructure/prisma/prisma.service';
import { CreateEstrategiaActividadEnlaceDto } from '../../application/dto/create-estrategia-actividad-enlace.dto';
import { UpdateEstrategiaActividadEnlaceDto } from '../../application/dto/update-estrategia-actividad-enlace.dto';
import { EstrategiaActividadEnlace } from '../../domain/entities/estrategia-actividad-enlace.entity';
import { EstrategiaActividadEnlaceFilters } from '../../domain/interfaces/estrategia-actividad-enlace-filters.interface';
import { EstrategiaActividadEnlaceRepository } from '../../domain/repositories/estrategia-actividad-enlace.repository';
import {
  int,
  positiveId,
  requiredText,
} from '../../../estrategia_comercial/estrategia-comercial.utils';

@Injectable()
export class PrismaEstrategiaActividadEnlaceRepository implements EstrategiaActividadEnlaceRepository {
  constructor(private readonly prisma: PrismaService) {}

  private requiredActividadId(value: unknown): number {
    const actividadId = int(value, 'actividad_id');

    if (!actividadId || actividadId <= 0) {
      throw new BadRequestException('actividad_id es obligatorio.');
    }

    return actividadId;
  }

  private async ensureActividadExists(actividadId: number): Promise<void> {
    const actividad = await this.prisma.estrategia_actividades.findUnique({
      where: { id: actividadId },
      select: { id: true },
    });

    if (!actividad) {
      throw new BadRequestException('La actividad indicada no existe.');
    }
  }

  findAll(
    filters: EstrategiaActividadEnlaceFilters,
  ): Promise<EstrategiaActividadEnlace[]> {
    const actividadId = int(
      filters.actividadId ?? filters.actividad_id,
      'actividad_id',
    );

    return this.prisma.estrategia_actividad_enlaces.findMany({
      where: actividadId ? { actividad_id: actividadId } : undefined,
      orderBy: { id: 'asc' },
    }) as unknown as Promise<EstrategiaActividadEnlace[]>;
  }

  findById(id: number): Promise<EstrategiaActividadEnlace | null> {
    return this.prisma.estrategia_actividad_enlaces.findUnique({
      where: { id: positiveId(id) },
    }) as unknown as Promise<EstrategiaActividadEnlace | null>;
  }

  async create(data: unknown): Promise<EstrategiaActividadEnlace> {
    const dto = data as CreateEstrategiaActividadEnlaceDto;
    const actividadId = this.requiredActividadId(
      dto.actividad_id ?? dto.actividadId,
    );

    await this.ensureActividadExists(actividadId);

    return this.prisma.estrategia_actividad_enlaces.create({
      data: {
        actividad_id: actividadId,
        nombre: requiredText(dto.nombre, 'nombre'),
        url: requiredText(dto.url, 'url'),
      },
    }) as unknown as Promise<EstrategiaActividadEnlace>;
  }

  async update(id: number, data: unknown): Promise<EstrategiaActividadEnlace> {
    const dto = data as UpdateEstrategiaActividadEnlaceDto;
    const actividadIdValue = dto.actividad_id ?? dto.actividadId;
    const actividadId =
      actividadIdValue === undefined
        ? undefined
        : this.requiredActividadId(actividadIdValue);

    if (actividadId !== undefined) {
      await this.ensureActividadExists(actividadId);
    }

    return this.prisma.estrategia_actividad_enlaces.update({
      where: { id: positiveId(id) },
      data: {
        actividad_id: actividadId,
        nombre:
          dto.nombre === undefined
            ? undefined
            : requiredText(dto.nombre, 'nombre'),
        url: dto.url === undefined ? undefined : requiredText(dto.url, 'url'),
      },
    }) as unknown as Promise<EstrategiaActividadEnlace>;
  }

  async delete(id: number): Promise<void> {
    await this.prisma.estrategia_actividad_enlaces.delete({
      where: { id: positiveId(id) },
    });
  }
}
