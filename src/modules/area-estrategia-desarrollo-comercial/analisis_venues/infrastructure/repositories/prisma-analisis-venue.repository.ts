import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, analisis_venues } from '@prisma/client';
import { PrismaService } from '../../../../../infrastructure/prisma/prisma.service';
import { CreateAnalisisVenueDto } from '../../application/dto/create-analisis-venue.dto';
import { UpdateAnalisisVenueDto } from '../../application/dto/update-analisis-venue.dto';
import { AnalisisVenue } from '../../domain/entities/analisis-venue.entity';
import {
  AnalisisVenueFilters,
  AnalisisVenueRepository,
} from '../../domain/repositories/analisis-venue.repository';

@Injectable()
export class PrismaAnalisisVenueRepository extends AnalisisVenueRepository {
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

  private toEntity(row: analisis_venues): AnalisisVenue {
    return new AnalisisVenue(row);
  }

  async findAll(filters?: AnalisisVenueFilters): Promise<AnalisisVenue[]> {
    const where: Prisma.analisis_venuesWhereInput = {};
    const estado = this.text(filters?.estado);
    const search = this.text(filters?.search);

    if (estado && estado.toUpperCase() !== 'TODOS') {
      where.estado = { equals: estado, mode: 'insensitive' };
    }

    if (search) {
      where.OR = [
        'nombre',
        'departamento',
        'distrito',
        'direccion',
        'celular',
        'correo',
        'estado',
        'sitio_web',
        'detalles',
      ].map((field) => ({
        [field]: { contains: search, mode: 'insensitive' },
      })) as Prisma.analisis_venuesWhereInput[];
    }

    const rows = await this.prisma.analisis_venues.findMany({
      where,
      orderBy: { id: 'asc' },
    });
    return rows.map((row) => this.toEntity(row));
  }

  async findById(id: number): Promise<AnalisisVenue | null> {
    this.validateId(id);
    const row = await this.prisma.analisis_venues.findUnique({ where: { id } });
    return row ? this.toEntity(row) : null;
  }

  async create(dto: CreateAnalisisVenueDto): Promise<AnalisisVenue> {
    const row = await this.prisma.analisis_venues.create({
      data: this.toCreateData(dto),
    });
    return this.toEntity(row);
  }

  async update(
    id: number,
    dto: UpdateAnalisisVenueDto,
  ): Promise<AnalisisVenue> {
    this.validateId(id);
    const exists = await this.findById(id);
    if (!exists) throw new NotFoundException('El venue no existe.');
    const row = await this.prisma.analisis_venues.update({
      where: { id },
      data: this.toUpdateData(dto),
    });
    return this.toEntity(row);
  }

  async delete(id: number): Promise<void> {
    this.validateId(id);
    const exists = await this.findById(id);
    if (!exists) throw new NotFoundException('El venue no existe.');
    await this.prisma.analisis_venues.delete({ where: { id } });
  }

  private toCreateData(
    dto: CreateAnalisisVenueDto,
  ): Prisma.analisis_venuesUncheckedCreateInput {
    return {
      nombre: this.requiredText(dto.nombre, 'nombre'),
      departamento: this.text(dto.departamento),
      distrito: this.text(dto.distrito),
      direccion: this.text(dto.direccion),
      celular: this.text(dto.celular),
      correo: this.text(dto.correo),
      capacidad_personas: this.int(
        dto.capacidad_personas ?? dto.capacidadPersonas,
        'capacidad_personas',
      ),
      estado: this.text(dto.estado),
      sitio_web: this.text(dto.sitio_web ?? dto.sitioWeb),
      detalles: this.text(dto.detalles),
    };
  }

  private toUpdateData(
    dto: UpdateAnalisisVenueDto,
  ): Prisma.analisis_venuesUncheckedUpdateInput {
    const nombre = this.text(dto.nombre);
    if (dto.nombre !== undefined && !nombre) {
      throw new BadRequestException('nombre es obligatorio.');
    }

    return {
      nombre: nombre ?? undefined,
      departamento: this.text(dto.departamento),
      distrito: this.text(dto.distrito),
      direccion: this.text(dto.direccion),
      celular: this.text(dto.celular),
      correo: this.text(dto.correo),
      capacidad_personas: this.int(
        dto.capacidad_personas ?? dto.capacidadPersonas,
        'capacidad_personas',
      ),
      estado: this.text(dto.estado),
      sitio_web: this.text(dto.sitio_web ?? dto.sitioWeb),
      detalles: this.text(dto.detalles),
    };
  }
}
