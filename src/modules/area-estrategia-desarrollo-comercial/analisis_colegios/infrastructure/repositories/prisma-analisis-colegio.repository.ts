import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, analisis_colegios } from '@prisma/client';
import { PrismaService } from '../../../../../infrastructure/prisma/prisma.service';
import { CreateAnalisisColegioDto } from '../../application/dto/create-analisis-colegio.dto';
import { UpdateAnalisisColegioDto } from '../../application/dto/update-analisis-colegio.dto';
import { AnalisisColegio } from '../../domain/entities/analisis-colegio.entity';
import {
  AnalisisColegioFilters,
  AnalisisColegioRepository,
} from '../../domain/repositories/analisis-colegio.repository';

@Injectable()
export class PrismaAnalisisColegioRepository extends AnalisisColegioRepository {
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

  private toEntity(row: analisis_colegios): AnalisisColegio {
    return new AnalisisColegio(row);
  }

  async findAll(filters?: AnalisisColegioFilters): Promise<AnalisisColegio[]> {
    const where: Prisma.analisis_colegiosWhereInput = {};
    const tipo = this.text(filters?.tipo);
    const search = this.text(filters?.search);

    if (tipo && tipo.toUpperCase() !== 'TODOS') {
      where.tipo = { equals: tipo, mode: 'insensitive' };
    }

    if (search) {
      where.OR = [
        'codigo_modular',
        'nombre',
        'correo',
        'telefono',
        'nivel',
        'director',
        'ugel',
        'departamento',
        'distrito',
        'zona',
        'direccion',
      ].map((field) => ({
        [field]: { contains: search, mode: 'insensitive' },
      })) as Prisma.analisis_colegiosWhereInput[];
    }

    const rows = await this.prisma.analisis_colegios.findMany({
      where,
      orderBy: { id: 'asc' },
    });

    return rows.map((row) => this.toEntity(row));
  }

  async findById(id: number): Promise<AnalisisColegio | null> {
    this.validateId(id);
    const row = await this.prisma.analisis_colegios.findUnique({
      where: { id },
    });
    return row ? this.toEntity(row) : null;
  }

  async create(dto: CreateAnalisisColegioDto): Promise<AnalisisColegio> {
    const row = await this.prisma.analisis_colegios.create({
      data: this.toCreateData(dto),
    });
    return this.toEntity(row);
  }

  async update(
    id: number,
    dto: UpdateAnalisisColegioDto,
  ): Promise<AnalisisColegio> {
    this.validateId(id);
    const exists = await this.findById(id);
    if (!exists) throw new NotFoundException('El colegio no existe.');

    const row = await this.prisma.analisis_colegios.update({
      where: { id },
      data: this.toUpdateData(dto),
    });
    return this.toEntity(row);
  }

  async delete(id: number): Promise<void> {
    this.validateId(id);
    const exists = await this.findById(id);
    if (!exists) throw new NotFoundException('El colegio no existe.');
    await this.prisma.analisis_colegios.delete({ where: { id } });
  }

  private toCreateData(
    dto: CreateAnalisisColegioDto,
  ): Prisma.analisis_colegiosUncheckedCreateInput {
    return {
      codigo_modular: this.text(dto.codigo_modular ?? dto.codigoModular),
      nombre: this.requiredText(
        dto.nombre ?? dto.nombre_colegio ?? dto.nombreColegio,
        'nombre',
      ),
      correo: this.text(dto.correo),
      telefono: this.text(dto.telefono),
      nivel: this.text(dto.nivel),
      director: this.text(dto.director),
      tipo: this.text(dto.tipo),
      ugel: this.text(dto.ugel),
      departamento: this.text(dto.departamento),
      distrito: this.text(dto.distrito),
      zona: this.text(dto.zona),
      cantidad_alumnos: this.int(
        dto.cantidad_alumnos ?? dto.cantidadAlumnos,
        'cantidad_alumnos',
      ),
      direccion: this.text(
        dto.direccion ?? dto.direccion_ie ?? dto.direccionIe,
      ),
    };
  }

  private toUpdateData(
    dto: UpdateAnalisisColegioDto,
  ): Prisma.analisis_colegiosUncheckedUpdateInput {
    const nombre = this.text(
      dto.nombre ?? dto.nombre_colegio ?? dto.nombreColegio,
    );

    if (
      (dto.nombre !== undefined ||
        dto.nombre_colegio !== undefined ||
        dto.nombreColegio !== undefined) &&
      !nombre
    ) {
      throw new BadRequestException('nombre es obligatorio.');
    }

    return {
      codigo_modular: this.text(dto.codigo_modular ?? dto.codigoModular),
      nombre: nombre ?? undefined,
      correo: this.text(dto.correo),
      telefono: this.text(dto.telefono),
      nivel: this.text(dto.nivel),
      director: this.text(dto.director),
      tipo: this.text(dto.tipo),
      ugel: this.text(dto.ugel),
      departamento: this.text(dto.departamento),
      distrito: this.text(dto.distrito),
      zona: this.text(dto.zona),
      cantidad_alumnos: this.int(
        dto.cantidad_alumnos ?? dto.cantidadAlumnos,
        'cantidad_alumnos',
      ),
      direccion: this.text(
        dto.direccion ?? dto.direccion_ie ?? dto.direccionIe,
      ),
    };
  }
}
