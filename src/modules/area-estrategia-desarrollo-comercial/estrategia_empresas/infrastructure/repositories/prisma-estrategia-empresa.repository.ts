import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../infrastructure/prisma/prisma.service';
import { CreateEstrategiaEmpresaDto } from '../../application/dto/create-estrategia-empresa.dto';
import { UpdateEstrategiaEmpresaDto } from '../../application/dto/update-estrategia-empresa.dto';
import { EstrategiaEmpresa } from '../../domain/entities/estrategia-empresa.entity';
import { EstrategiaEmpresaFilters } from '../../domain/interfaces/estrategia-empresa-filters.interface';
import { EstrategiaEmpresaRepository } from '../../domain/repositories/estrategia-empresa.repository';
import {
  positiveId,
  requiredText,
  text,
} from '../../../estrategia_comercial/estrategia-comercial.utils';

@Injectable()
export class PrismaEstrategiaEmpresaRepository implements EstrategiaEmpresaRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(filters: EstrategiaEmpresaFilters): Promise<EstrategiaEmpresa[]> {
    const parsedSearch = text(filters.search);
    const where = parsedSearch
      ? {
          OR: [
            {
              nombre: { contains: parsedSearch, mode: 'insensitive' as const },
            },
            {
              descripcion: {
                contains: parsedSearch,
                mode: 'insensitive' as const,
              },
            },
          ],
        }
      : undefined;

    return this.prisma.estrategia_empresas.findMany({
      where,
      include: {
        estrategia_proyectos: {
          include: { estrategia_proyecto_enlaces: { orderBy: { id: 'asc' } } },
          orderBy: { id: 'asc' },
        },
      },
      orderBy: { id: 'asc' },
    }) as unknown as Promise<EstrategiaEmpresa[]>;
  }

  findById(id: number): Promise<EstrategiaEmpresa | null> {
    return this.prisma.estrategia_empresas.findUnique({
      where: { id: positiveId(id) },
      include: {
        estrategia_proyectos: {
          include: { estrategia_proyecto_enlaces: { orderBy: { id: 'asc' } } },
          orderBy: { id: 'asc' },
        },
      },
    }) as unknown as Promise<EstrategiaEmpresa | null>;
  }

  create(data: unknown): Promise<EstrategiaEmpresa> {
    const dto = data as CreateEstrategiaEmpresaDto;

    return this.prisma.estrategia_empresas.create({
      data: {
        nombre: requiredText(dto.nombre, 'nombre'),
        descripcion: text(dto.descripcion),
      },
    }) as unknown as Promise<EstrategiaEmpresa>;
  }

  update(id: number, data: unknown): Promise<EstrategiaEmpresa> {
    const dto = data as UpdateEstrategiaEmpresaDto;

    return this.prisma.estrategia_empresas.update({
      where: { id: positiveId(id) },
      data: {
        nombre:
          dto.nombre === undefined
            ? undefined
            : requiredText(dto.nombre, 'nombre'),
        descripcion: text(dto.descripcion),
      },
    }) as unknown as Promise<EstrategiaEmpresa>;
  }

  async delete(id: number): Promise<void> {
    await this.prisma.estrategia_empresas.delete({
      where: { id: positiveId(id) },
    });
  }
}
