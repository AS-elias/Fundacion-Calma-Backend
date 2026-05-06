import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, analisis_difusiones } from '@prisma/client';
import { PrismaService } from '../../../../../infrastructure/prisma/prisma.service';
import { CreateAnalisisDifusionDto } from '../../application/dto/create-analisis-difusion.dto';
import { UpdateAnalisisDifusionDto } from '../../application/dto/update-analisis-difusion.dto';
import { AnalisisDifusion } from '../../domain/entities/analisis-difusion.entity';
import {
  AnalisisDifusionFilters,
  AnalisisDifusionRepository,
} from '../../domain/repositories/analisis-difusion.repository';

@Injectable()
export class PrismaAnalisisDifusionRepository extends AnalisisDifusionRepository {
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

  private toEntity(row: analisis_difusiones): AnalisisDifusion {
    return new AnalisisDifusion(row);
  }

  async findAll(
    filters?: AnalisisDifusionFilters,
  ): Promise<AnalisisDifusion[]> {
    const where: Prisma.analisis_difusionesWhereInput = {};
    const estado = this.text(filters?.estado);
    const search = this.text(filters?.search);

    if (estado && estado.toUpperCase() !== 'TODOS') {
      where.estado = { equals: estado, mode: 'insensitive' };
    }

    if (search) {
      where.OR = [
        'nombre',
        'tipo',
        'plataforma',
        'lugar',
        'contacto',
        'celular',
        'correo',
        'estado',
        'observaciones',
      ].map((field) => ({
        [field]: { contains: search, mode: 'insensitive' },
      })) as Prisma.analisis_difusionesWhereInput[];
    }

    const rows = await this.prisma.analisis_difusiones.findMany({
      where,
      orderBy: { id: 'asc' },
    });
    return rows.map((row) => this.toEntity(row));
  }

  async findById(id: number): Promise<AnalisisDifusion | null> {
    this.validateId(id);
    const row = await this.prisma.analisis_difusiones.findUnique({
      where: { id },
    });
    return row ? this.toEntity(row) : null;
  }

  async create(dto: CreateAnalisisDifusionDto): Promise<AnalisisDifusion> {
    const row = await this.prisma.analisis_difusiones.create({
      data: this.toCreateData(dto),
    });
    return this.toEntity(row);
  }

  async update(
    id: number,
    dto: UpdateAnalisisDifusionDto,
  ): Promise<AnalisisDifusion> {
    this.validateId(id);
    const exists = await this.findById(id);
    if (!exists) throw new NotFoundException('La difusion no existe.');
    const row = await this.prisma.analisis_difusiones.update({
      where: { id },
      data: this.toUpdateData(dto),
    });
    return this.toEntity(row);
  }

  async delete(id: number): Promise<void> {
    this.validateId(id);
    const exists = await this.findById(id);
    if (!exists) throw new NotFoundException('La difusion no existe.');
    await this.prisma.analisis_difusiones.delete({ where: { id } });
  }

  private toCreateData(
    dto: CreateAnalisisDifusionDto,
  ): Prisma.analisis_difusionesUncheckedCreateInput {
    return {
      nombre: this.requiredText(dto.nombre, 'nombre'),
      tipo: this.text(dto.tipo),
      plataforma: this.text(dto.plataforma),
      lugar: this.text(dto.lugar),
      contacto: this.text(dto.contacto),
      celular: this.text(dto.celular),
      correo: this.text(dto.correo),
      fecha: this.date(dto.fecha, 'fecha'),
      estado: this.text(dto.estado),
      observaciones: this.text(dto.observaciones),
    };
  }

  private toUpdateData(
    dto: UpdateAnalisisDifusionDto,
  ): Prisma.analisis_difusionesUncheckedUpdateInput {
    const nombre = this.text(dto.nombre);
    if (dto.nombre !== undefined && !nombre) {
      throw new BadRequestException('nombre es obligatorio.');
    }

    return {
      nombre: nombre ?? undefined,
      tipo: this.text(dto.tipo),
      plataforma: this.text(dto.plataforma),
      lugar: this.text(dto.lugar),
      contacto: this.text(dto.contacto),
      celular: this.text(dto.celular),
      correo: this.text(dto.correo),
      fecha: this.date(dto.fecha, 'fecha'),
      estado: this.text(dto.estado),
      observaciones: this.text(dto.observaciones),
    };
  }
}
