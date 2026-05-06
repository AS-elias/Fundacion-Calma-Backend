import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../infrastructure/prisma/prisma.service';
import { CreateEstrategiaProyectoEnlaceDto } from '../../application/dto/create-estrategia-proyecto-enlace.dto';
import { UpdateEstrategiaProyectoEnlaceDto } from '../../application/dto/update-estrategia-proyecto-enlace.dto';
import { EstrategiaProyectoEnlace } from '../../domain/entities/estrategia-proyecto-enlace.entity';
import { EstrategiaProyectoEnlaceFilters } from '../../domain/interfaces/estrategia-proyecto-enlace-filters.interface';
import { EstrategiaProyectoEnlaceRepository } from '../../domain/repositories/estrategia-proyecto-enlace.repository';
import {
  int,
  positiveId,
  requiredText,
} from '../../../estrategia_comercial/estrategia-comercial.utils';

@Injectable()
export class PrismaEstrategiaProyectoEnlaceRepository implements EstrategiaProyectoEnlaceRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(
    filters: EstrategiaProyectoEnlaceFilters,
  ): Promise<EstrategiaProyectoEnlace[]> {
    const proyectoId = int(
      filters.proyectoId ?? filters.proyecto_id,
      'proyecto_id',
    );

    return this.prisma.estrategia_proyecto_enlaces.findMany({
      where: proyectoId ? { proyecto_id: proyectoId } : undefined,
      orderBy: { id: 'asc' },
    }) as unknown as Promise<EstrategiaProyectoEnlace[]>;
  }

  findById(id: number): Promise<EstrategiaProyectoEnlace | null> {
    return this.prisma.estrategia_proyecto_enlaces.findUnique({
      where: { id: positiveId(id) },
    }) as unknown as Promise<EstrategiaProyectoEnlace | null>;
  }

  create(data: unknown): Promise<EstrategiaProyectoEnlace> {
    const dto = data as CreateEstrategiaProyectoEnlaceDto;

    return this.prisma.estrategia_proyecto_enlaces.create({
      data: {
        proyecto_id: int(dto.proyecto_id ?? dto.proyectoId, 'proyecto_id'),
        etiqueta: requiredText(dto.etiqueta, 'etiqueta'),
        url: requiredText(dto.url, 'url'),
      },
    }) as unknown as Promise<EstrategiaProyectoEnlace>;
  }

  update(id: number, data: unknown): Promise<EstrategiaProyectoEnlace> {
    const dto = data as UpdateEstrategiaProyectoEnlaceDto;

    return this.prisma.estrategia_proyecto_enlaces.update({
      where: { id: positiveId(id) },
      data: {
        proyecto_id: int(dto.proyecto_id ?? dto.proyectoId, 'proyecto_id'),
        etiqueta:
          dto.etiqueta === undefined
            ? undefined
            : requiredText(dto.etiqueta, 'etiqueta'),
        url: dto.url === undefined ? undefined : requiredText(dto.url, 'url'),
      },
    }) as unknown as Promise<EstrategiaProyectoEnlace>;
  }

  async delete(id: number): Promise<void> {
    await this.prisma.estrategia_proyecto_enlaces.delete({
      where: { id: positiveId(id) },
    });
  }
}
