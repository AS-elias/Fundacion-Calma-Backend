import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';

import { RepositorioDocumento } from '../../domain/entities/repositorio-documento.entity';
import { RepositorioDocumentoRepository } from '../../domain/repositories/repositorio-documento.repository';
import { CreateCarpetaDto } from '../../application/dto/create-carpeta.dto';

@Injectable()
export class PrismaRepositorioDocumentoRepository
  implements RepositorioDocumentoRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async listarBloques() {
    const bloques = await this.prisma.repositorio_bloques.findMany({
      include: {
        repositorio_enlaces: true,
        repositorio_carpetas: true,
      },
      orderBy: {
        id: 'asc',
      },
    });

    return bloques.map((bloque) => {
      const carpetas = bloque.repositorio_carpetas.map(c => ({
        id: c.id,
        nombre: c.nombre,
        url: "",
        esCarpeta: true,
        padreId: c.padre_id
      }));

      const documentos = bloque.repositorio_enlaces.map(doc => ({
        id: doc.id,
        nombre: doc.nombre_documento,
        url: doc.url_drive,
        esCarpeta: false,
        padreId: doc.carpeta_id
      }));

      return {
        id: bloque.id,
        titulo: bloque.titulo,
        subtitulo: bloque.subtitulo,
        icono: bloque.icono,
        documentos: [...carpetas, ...documentos],
      };
    });
  }

  async existsBloque(bloqueId: number): Promise<boolean> {
    const bloque = await this.prisma.repositorio_bloques.findUnique({
      where: {
        id: bloqueId,
      },
      select: {
        id: true,
      },
    });

    return Boolean(bloque);
  }

  async create(data: RepositorioDocumento): Promise<RepositorioDocumento> {
    const doc = await this.prisma.repositorio_enlaces.create({
      data: {
        bloque_id: data.bloqueId,
        carpeta_id: data.carpetaId,
        nombre_documento: data.nombreDocumento,
        url_drive: data.urlDocumento,
      },
    });

    return new RepositorioDocumento(
      doc.id,
      doc.bloque_id as number,
      doc.nombre_documento,
      doc.url_drive,
      doc.fecha_agregado ?? new Date(),
      doc.carpeta_id,
    );
  }

  async crearCarpeta(data: CreateCarpetaDto) {
    return this.prisma.repositorio_carpetas.create({
      data: {
        bloque_id: data.bloqueId,
        padre_id: data.padreId || null,
        nombre: data.nombre,
      },
    });
  }

  async findByBloque(bloqueId: number): Promise<any> {
    const carpetas = await this.prisma.repositorio_carpetas.findMany({
      where: { bloque_id: bloqueId },
      orderBy: { fecha_creacion: 'asc' },
    });

    const docs = await this.prisma.repositorio_enlaces.findMany({
      where: { bloque_id: bloqueId },
      orderBy: { fecha_agregado: 'desc' },
    });

    const carpetasFormat = carpetas.map(c => ({
      id: c.id,
      nombre: c.nombre,
      url: "",
      esCarpeta: true,
      padreId: c.padre_id
    }));

    const documentosFormat = docs.map(doc => ({
      id: doc.id,
      nombre: doc.nombre_documento,
      url: doc.url_drive,
      esCarpeta: false,
      padreId: doc.carpeta_id
    }));

    return [...carpetasFormat, ...documentosFormat];
  }

  async findByCarpeta(carpetaId: number): Promise<any> {
    const carpetas = await this.prisma.repositorio_carpetas.findMany({
      where: { padre_id: carpetaId },
      orderBy: { fecha_creacion: 'asc' },
    });

    const docs = await this.prisma.repositorio_enlaces.findMany({
      where: { carpeta_id: carpetaId },
      orderBy: { fecha_agregado: 'desc' },
    });

    const carpetasFormat = carpetas.map(c => ({
      id: c.id,
      nombre: c.nombre,
      url: "",
      esCarpeta: true,
      padreId: c.padre_id
    }));

    const documentosFormat = docs.map(doc => ({
      id: doc.id,
      nombre: doc.nombre_documento,
      url: doc.url_drive,
      esCarpeta: false,
      padreId: doc.carpeta_id
    }));

    return [...carpetasFormat, ...documentosFormat];
  }

  async deleteCarpeta(id: number): Promise<void> {
    await this.prisma.repositorio_carpetas.delete({
      where: { id },
    });
  }

  async delete(id: number): Promise<void> {
    await this.prisma.repositorio_enlaces.delete({
      where: {
        id,
      },
    });
  }

  async mover(id: number, padreId: number | null, esCarpeta: boolean): Promise<any> {
    if (esCarpeta) {
      return this.prisma.repositorio_carpetas.update({
        where: { id },
        data: { padre_id: padreId }
      });
    } else {
      return this.prisma.repositorio_enlaces.update({
        where: { id },
        data: { carpeta_id: padreId }
      });
    }
  }
}
