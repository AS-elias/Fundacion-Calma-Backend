import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, analisis_empresas } from '@prisma/client';
import { PrismaService } from '../../../../../infrastructure/prisma/prisma.service';
import { CreateAnalisisEmpresaDto } from '../../application/dto/create-analisis-empresa.dto';
import { UpdateAnalisisEmpresaDto } from '../../application/dto/update-analisis-empresa.dto';
import { AnalisisEmpresa } from '../../domain/entities/analisis-empresa.entity';
import {
  AnalisisEmpresaFilters,
  AnalisisEmpresaRepository,
} from '../../domain/repositories/analisis-empresa.repository';

@Injectable()
export class PrismaAnalisisEmpresaRepository extends AnalisisEmpresaRepository {
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

  private validateId(id: number) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestException('El id es invalido.');
    }
  }

  private toEntity(row: analisis_empresas): AnalisisEmpresa {
    return new AnalisisEmpresa(row);
  }

  async findAll(filters?: AnalisisEmpresaFilters): Promise<AnalisisEmpresa[]> {
    const where: Prisma.analisis_empresasWhereInput = {};
    const estado = this.text(filters?.estado);
    const search = this.text(filters?.search);

    if (estado && estado.toUpperCase() !== 'TODOS') {
      where.estado = { equals: estado, mode: 'insensitive' };
    }

    if (search) {
      where.OR = [
        'ruc',
        'nombre',
        'correo',
        'telefono_fijo',
        'celular',
        'departamento',
        'distrito',
        'direccion',
        'sector',
        'descripcion',
      ].map((field) => ({
        [field]: { contains: search, mode: 'insensitive' },
      })) as Prisma.analisis_empresasWhereInput[];
    }

    const rows = await this.prisma.analisis_empresas.findMany({
      where,
      orderBy: { id: 'asc' },
    });
    return rows.map((row) => this.toEntity(row));
  }

  async findById(id: number): Promise<AnalisisEmpresa | null> {
    this.validateId(id);
    const row = await this.prisma.analisis_empresas.findUnique({
      where: { id },
    });
    return row ? this.toEntity(row) : null;
  }

  async create(dto: CreateAnalisisEmpresaDto): Promise<AnalisisEmpresa> {
    const row = await this.prisma.analisis_empresas.create({
      data: this.toCreateData(dto),
    });
    return this.toEntity(row);
  }

  async update(
    id: number,
    dto: UpdateAnalisisEmpresaDto,
  ): Promise<AnalisisEmpresa> {
    this.validateId(id);
    const exists = await this.findById(id);
    if (!exists) throw new NotFoundException('La empresa no existe.');

    const row = await this.prisma.analisis_empresas.update({
      where: { id },
      data: this.toUpdateData(dto),
    });
    return this.toEntity(row);
  }

  async delete(id: number): Promise<void> {
    this.validateId(id);
    const exists = await this.findById(id);
    if (!exists) throw new NotFoundException('La empresa no existe.');
    await this.prisma.analisis_empresas.delete({ where: { id } });
  }

  private toCreateData(
    dto: CreateAnalisisEmpresaDto,
  ): Prisma.analisis_empresasUncheckedCreateInput {
    return {
      ruc: this.text(dto.ruc),
      nombre: this.requiredText(
        dto.nombre ?? dto.nombre_empresa ?? dto.nombreEmpresa,
        'nombre',
      ),
      correo: this.text(dto.correo),
      telefono_fijo: this.text(dto.telefono_fijo ?? dto.telefonoFijo),
      celular: this.text(dto.celular),
      departamento: this.text(dto.departamento),
      distrito: this.text(dto.distrito),
      direccion: this.text(dto.direccion),
      sector: this.text(dto.sector),
      estado: this.text(dto.estado),
      descripcion: this.text(dto.descripcion),
    };
  }

  private toUpdateData(
    dto: UpdateAnalisisEmpresaDto,
  ): Prisma.analisis_empresasUncheckedUpdateInput {
    const nombre = this.text(
      dto.nombre ?? dto.nombre_empresa ?? dto.nombreEmpresa,
    );

    if (
      (dto.nombre !== undefined ||
        dto.nombre_empresa !== undefined ||
        dto.nombreEmpresa !== undefined) &&
      !nombre
    ) {
      throw new BadRequestException('nombre es obligatorio.');
    }

    return {
      ruc: this.text(dto.ruc),
      nombre: nombre ?? undefined,
      correo: this.text(dto.correo),
      telefono_fijo: this.text(dto.telefono_fijo ?? dto.telefonoFijo),
      celular: this.text(dto.celular),
      departamento: this.text(dto.departamento),
      distrito: this.text(dto.distrito),
      direccion: this.text(dto.direccion),
      sector: this.text(dto.sector),
      estado: this.text(dto.estado),
      descripcion: this.text(dto.descripcion),
    };
  }
}
