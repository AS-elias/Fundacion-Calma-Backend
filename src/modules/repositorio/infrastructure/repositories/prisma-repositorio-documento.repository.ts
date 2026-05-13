import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';

import { RepositorioDocumento } from '../../domain/entities/repositorio-documento.entity';
import { RepositorioDocumentoRepository } from '../../domain/repositories/repositorio-documento.repository';

@Injectable()
export class PrismaRepositorioDocumentoRepository
  implements RepositorioDocumentoRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async listarBloques() {
    const bloques = await this.prisma.repositorio_bloques.findMany({
      include: {
        repositorio_enlaces: true,
      },
      orderBy: {
        id: 'asc',
      },
    });

    return bloques.map((bloque) => ({
      id: bloque.id,
      titulo: bloque.titulo,
      subtitulo: bloque.subtitulo,
      icono: bloque.icono,
      documentos: bloque.repositorio_enlaces.map((doc) => ({
        id: doc.id,
        nombre: doc.nombre_documento,
        url: doc.url_drive,
        fecha: doc.fecha_agregado,
      })),
    }));
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
    );
  }

  async findByBloque(bloqueId: number): Promise<RepositorioDocumento[]> {
    const docs = await this.prisma.repositorio_enlaces.findMany({
      where: {
        bloque_id: bloqueId,
      },
      orderBy: {
        fecha_agregado: 'desc',
      },
    });

    return docs.map(
      (doc) =>
        new RepositorioDocumento(
          doc.id,
          doc.bloque_id as number,
          doc.nombre_documento,
          doc.url_drive,
          doc.fecha_agregado ?? new Date(),
        ),
    );
  }

  async delete(id: number): Promise<void> {
    await this.prisma.repositorio_enlaces.delete({
      where: {
        id,
      },
    });
  }
}
