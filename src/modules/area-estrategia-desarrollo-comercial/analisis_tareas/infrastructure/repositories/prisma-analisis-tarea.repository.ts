import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../infrastructure/prisma/prisma.service';
import { AnalisisTareaEnlace } from '../../../analisis_tarea_enlaces/domain/entities/analisis-tarea-enlace.entity';
import { CreateAnalisisTareaDto } from '../../application/dto/create-analisis-tarea.dto';
import { UpdateAnalisisTareaDto } from '../../application/dto/update-analisis-tarea.dto';
import { AnalisisTarea } from '../../domain/entities/analisis-tarea.entity';
import {
  AnalisisTareaFilters,
  AnalisisTareaRepository,
} from '../../domain/repositories/analisis-tarea.repository';

type TareaWithEnlaces = Prisma.analisis_tareasGetPayload<{
  include: { analisis_tarea_enlaces: true };
}>;

@Injectable()
export class PrismaAnalisisTareaRepository extends AnalisisTareaRepository {
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

  private date(value: unknown, field: string): Date | null | undefined {
    if (value === undefined) return undefined;
    if (value === null || value === '') return null;
    const textValue = String(value).trim();
    const ddmmyyyy = textValue.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    const parsed = ddmmyyyy
      ? new Date(`${ddmmyyyy[3]}-${ddmmyyyy[2]}-${ddmmyyyy[1]}T00:00:00`)
      : new Date(textValue);
    if (Number.isNaN(parsed.getTime())) {
      throw new BadRequestException(`${field} debe tener un formato valido.`);
    }
    return parsed;
  }

  private validateId(id: number) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestException('El id es invalido.');
    }
  }

  private toEntity(row: TareaWithEnlaces): AnalisisTarea {
    return new AnalisisTarea({
      ...row,
      analisis_tarea_enlaces: row.analisis_tarea_enlaces.map(
        (enlace) => new AnalisisTareaEnlace(enlace),
      ),
    });
  }

  async findAll(filters?: AnalisisTareaFilters): Promise<AnalisisTarea[]> {
    const where: Prisma.analisis_tareasWhereInput = {};
    const estado = this.text(filters?.estado);
    const search = this.text(filters?.search);

    if (estado && estado.toUpperCase() !== 'TODOS') {
      where.estado = { equals: estado, mode: 'insensitive' };
    }

    if (search) {
      where.OR = [
        { titulo: { contains: search, mode: 'insensitive' } },
        { subtitulo: { contains: search, mode: 'insensitive' } },
        { descripcion: { contains: search, mode: 'insensitive' } },
      ];
    }

    const rows = await this.prisma.analisis_tareas.findMany({
      where,
      include: { analisis_tarea_enlaces: { orderBy: { id: 'asc' } } },
      orderBy: { id: 'asc' },
    });
    return rows.map((row) => this.toEntity(row));
  }

  async findById(id: number): Promise<AnalisisTarea | null> {
    this.validateId(id);
    const row = await this.prisma.analisis_tareas.findUnique({
      where: { id },
      include: { analisis_tarea_enlaces: { orderBy: { id: 'asc' } } },
    });
    return row ? this.toEntity(row) : null;
  }

  async create(dto: CreateAnalisisTareaDto): Promise<AnalisisTarea> {
    const row = await this.prisma.analisis_tareas.create({
      data: this.toCreateData(dto),
      include: { analisis_tarea_enlaces: { orderBy: { id: 'asc' } } },
    });
    return this.toEntity(row);
  }

  async update(
    id: number,
    dto: UpdateAnalisisTareaDto,
  ): Promise<AnalisisTarea> {
    this.validateId(id);
    const exists = await this.findById(id);
    if (!exists) throw new NotFoundException('La tarea no existe.');
    const row = await this.prisma.analisis_tareas.update({
      where: { id },
      data: this.toUpdateData(dto),
      include: { analisis_tarea_enlaces: { orderBy: { id: 'asc' } } },
    });
    return this.toEntity(row);
  }

  async delete(id: number): Promise<void> {
    this.validateId(id);
    const exists = await this.findById(id);
    if (!exists) throw new NotFoundException('La tarea no existe.');
    await this.prisma.analisis_tareas.delete({ where: { id } });
  }

  private toCreateData(
    dto: CreateAnalisisTareaDto,
  ): Prisma.analisis_tareasUncheckedCreateInput {
    const enlaces = Array.isArray(dto.enlaces) ? dto.enlaces : [];

    return {
      area_id: this.int(dto.area_id ?? dto.areaId, 'area_id'),
      titulo: this.requiredText(dto.titulo, 'titulo'),
      subtitulo: this.text(dto.subtitulo),
      descripcion: this.text(dto.descripcion),
      estado: this.text(dto.estado),
      fecha_limite: this.date(
        dto.fecha_limite ?? dto.fechaLimite,
        'fecha_limite',
      ),
      creador_id: this.int(dto.creador_id ?? dto.creadorId, 'creador_id'),
      analisis_tarea_enlaces: {
        create: enlaces.map((enlace) => ({
          nombre: this.requiredText(enlace.nombre, 'nombre'),
          url: this.requiredText(enlace.url, 'url'),
        })),
      },
    };
  }

  private toUpdateData(
    dto: UpdateAnalisisTareaDto,
  ): Prisma.analisis_tareasUncheckedUpdateInput {
    const titulo = this.text(dto.titulo);
    if (dto.titulo !== undefined && !titulo) {
      throw new BadRequestException('titulo es obligatorio.');
    }

    return {
      area_id: this.int(dto.area_id ?? dto.areaId, 'area_id'),
      titulo: titulo ?? undefined,
      subtitulo: this.text(dto.subtitulo),
      descripcion: this.text(dto.descripcion),
      estado: this.text(dto.estado),
      fecha_limite: this.date(
        dto.fecha_limite ?? dto.fechaLimite,
        'fecha_limite',
      ),
      creador_id: this.int(dto.creador_id ?? dto.creadorId, 'creador_id'),
    };
  }
}
