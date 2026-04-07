import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../infrastructure/prisma/prisma.service';
import { Convenio } from '../../domain/entities/convenio.entity';

@Injectable()
export class PrismaConvenioRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(convenio: Convenio): Promise<Convenio> {
    const created = await this.prisma.convenios.create({
      data: {
        area_id: convenio.areaId,
        entidad_nombre: convenio.entidadNombre,
        logo_url: convenio.logoUrl,
        ruc: convenio.ruc,
        rubro: convenio.rubro,
        contacto_nombre: convenio.contactoNombre,
        telefono_contacto: convenio.telefonoContacto,
        estado: convenio.estado,
        fecha_expiracion: convenio.fechaExpiracion
          ? new Date(convenio.fechaExpiracion)
          : null,
        creador_id: convenio.creadorId,
      },
    });

    return new Convenio(
      created.id,
      created.area_id as number,
      created.entidad_nombre,
      created.logo_url,
      created.ruc ?? '',
      created.rubro ?? '',
      created.contacto_nombre ?? '',
      created.telefono_contacto ?? '',
      created.estado ?? '',
      created.fecha_expiracion ?? new Date(),
      created.creador_id as number,
      created.fecha_creacion ?? new Date(),
    );
  }

  async findAll(): Promise<Convenio[]> {
    const convenios = await this.prisma.convenios.findMany();

    return convenios.map(
      (c) =>
        new Convenio(
          c.id,
          c.area_id as number,
          c.entidad_nombre,
          c.logo_url,
          c.ruc ?? '',
          c.rubro ?? '',
          c.contacto_nombre ?? '',
          c.telefono_contacto ?? '',
          c.estado ?? '',
          c.fecha_expiracion ?? new Date(),
          c.creador_id as number,
          c.fecha_creacion ?? new Date(),
        ),
    );
  }

  async findById(id: number): Promise<Convenio | null> {
    const convenio = await this.prisma.convenios.findUnique({
      where: { id },
    });

    if (!convenio) return null;

    return new Convenio(
      convenio.id,
      convenio.area_id as number,
      convenio.entidad_nombre,
      convenio.logo_url,
      convenio.ruc ?? '',
      convenio.rubro ?? '',
      convenio.contacto_nombre ?? '',
      convenio.telefono_contacto ?? '',
      convenio.estado ?? '',
      convenio.fecha_expiracion ?? new Date(),
      convenio.creador_id as number,
      convenio.fecha_creacion ?? new Date(),
    );
  }

  async update(id: number, convenioData: Partial<Convenio>): Promise<Convenio> {
    const updated = await this.prisma.convenios.update({
      where: { id },
      data: {
        area_id: convenioData.areaId,
        entidad_nombre: convenioData.entidadNombre,
        logo_url: convenioData.logoUrl,
        ruc: convenioData.ruc,
        rubro: convenioData.rubro,
        contacto_nombre: convenioData.contactoNombre,
        telefono_contacto: convenioData.telefonoContacto,
        estado: convenioData.estado,
        fecha_expiracion: convenioData.fechaExpiracion
          ? new Date(convenioData.fechaExpiracion)
          : undefined,
      },
    });

    return new Convenio(
      updated.id,
      updated.area_id as number,
      updated.entidad_nombre,
      updated.logo_url,
      updated.ruc ?? '',
      updated.rubro ?? '',
      updated.contacto_nombre ?? '',
      updated.telefono_contacto ?? '',
      updated.estado ?? '',
      updated.fecha_expiracion ?? new Date(),
      updated.creador_id as number,
      updated.fecha_creacion ?? new Date(),
    );
  }

  async delete(id: number): Promise<void> {
    await this.prisma.convenios.delete({
      where: { id },
    });
  }
}
