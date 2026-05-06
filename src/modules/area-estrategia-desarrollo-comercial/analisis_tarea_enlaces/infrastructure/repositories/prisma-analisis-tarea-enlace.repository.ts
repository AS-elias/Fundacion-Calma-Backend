import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, analisis_tarea_enlaces } from '@prisma/client';
import { PrismaService } from '../../../../../infrastructure/prisma/prisma.service';
import { CreateAnalisisTareaEnlaceDto } from '../../application/dto/create-analisis-tarea-enlace.dto';
import { UpdateAnalisisTareaEnlaceDto } from '../../application/dto/update-analisis-tarea-enlace.dto';
import { AnalisisTareaEnlace } from '../../domain/entities/analisis-tarea-enlace.entity';
import {
  AnalisisTareaEnlaceFilters,
  AnalisisTareaEnlaceRepository,
} from '../../domain/repositories/analisis-tarea-enlace.repository';

@Injectable()
export class PrismaAnalisisTareaEnlaceRepository extends AnalisisTareaEnlaceRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  private text(value: unknown): string | null | undefined {
    if (value === undefined) return undefined;
    if (value === null) return null;
    const trimmed = String(value).trim();
    return trimmed === '' ? null : trimmed;
  }

  private requiredText(value: unknown, field: string): string {
    const normalized = this.text(value);
    if (!normalized) throw new BadRequestException(`${field} es obligatorio.`);
    return normalized;
  }

  private int(value: unknown, field: string): number | null | undefined {
    if (value === undefined) return undefined;
    if (value === null || value === '') return null;
    const parsed = Number(value);
    if (!Number.isInteger(parsed)) {
      throw new BadRequestException(`${field} debe ser un numero valido.`);
    }
    return parsed;
  }

  private validateId(id: number) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestException('El id es invalido.');
    }
  }

  private toEntity(row: analisis_tarea_enlaces): AnalisisTareaEnlace {
    return new AnalisisTareaEnlace(row);
  }

  async findAll(
    filters?: AnalisisTareaEnlaceFilters,
  ): Promise<AnalisisTareaEnlace[]> {
    const rows = await this.prisma.analisis_tarea_enlaces.findMany({
      where: filters?.tareaId ? { tarea_id: filters.tareaId } : undefined,
      orderBy: { id: 'asc' },
    });
    return rows.map((row) => this.toEntity(row));
  }

  async findById(id: number): Promise<AnalisisTareaEnlace | null> {
    this.validateId(id);
    const row = await this.prisma.analisis_tarea_enlaces.findUnique({
      where: { id },
    });
    return row ? this.toEntity(row) : null;
  }

  async create(
    dto: CreateAnalisisTareaEnlaceDto,
  ): Promise<AnalisisTareaEnlace> {
    const row = await this.prisma.analisis_tarea_enlaces.create({
      data: this.toCreateData(dto),
    });
    return this.toEntity(row);
  }

  async update(
    id: number,
    dto: UpdateAnalisisTareaEnlaceDto,
  ): Promise<AnalisisTareaEnlace> {
    this.validateId(id);
    const exists = await this.findById(id);
    if (!exists) throw new NotFoundException('El enlace no existe.');
    const row = await this.prisma.analisis_tarea_enlaces.update({
      where: { id },
      data: this.toUpdateData(dto),
    });
    return this.toEntity(row);
  }

  async delete(id: number): Promise<void> {
    this.validateId(id);
    const exists = await this.findById(id);
    if (!exists) throw new NotFoundException('El enlace no existe.');
    await this.prisma.analisis_tarea_enlaces.delete({ where: { id } });
  }

  private toCreateData(
    dto: CreateAnalisisTareaEnlaceDto,
  ): Prisma.analisis_tarea_enlacesUncheckedCreateInput {
    return {
      tarea_id: this.int(dto.tarea_id ?? dto.tareaId, 'tarea_id'),
      nombre: this.requiredText(dto.nombre, 'nombre'),
      url: this.requiredText(dto.url, 'url'),
    };
  }

  private toUpdateData(
    dto: UpdateAnalisisTareaEnlaceDto,
  ): Prisma.analisis_tarea_enlacesUncheckedUpdateInput {
    const nombre = this.text(dto.nombre);
    const url = this.text(dto.url);

    if (dto.nombre !== undefined && !nombre) {
      throw new BadRequestException('nombre es obligatorio.');
    }

    if (dto.url !== undefined && !url) {
      throw new BadRequestException('url es obligatorio.');
    }

    return {
      tarea_id: this.int(dto.tarea_id ?? dto.tareaId, 'tarea_id'),
      nombre: nombre ?? undefined,
      url: url ?? undefined,
    };
  }
}
