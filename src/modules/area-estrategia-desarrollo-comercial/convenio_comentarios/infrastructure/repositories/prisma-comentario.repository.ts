import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../infrastructure/prisma/prisma.service';
import { ComentarioRepository } from '../../domain/repositories/comentario.repository';
import { ConvenioComentario } from '../../domain/entities/comentario.entity';

@Injectable()
export class PrismaComentarioRepository extends ComentarioRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async create(data: ConvenioComentario): Promise<ConvenioComentario> {
    const comentario = await this.prisma.convenio_comentarios.create({
      data: {
        convenio_id: data.convenioId,
        usuario_id: data.usuarioId,
        comentario: data.comentario,
      },
      include: {
        usuarios: {
          select: {
            nombre_completo: true,
            apellido_completo: true,
          },
        },
      },
    });

    return new ConvenioComentario(
      comentario.id,
      comentario.convenio_id as number,
      comentario.usuario_id as number,
      comentario.comentario,
      comentario.fecha_creacion ?? new Date(),
      this.nombreUsuario(comentario.usuarios),
    );
  }

  async findById(id: number): Promise<ConvenioComentario | null> {
    const comentario = await this.prisma.convenio_comentarios.findUnique({
      where: { id },
      include: {
        usuarios: {
          select: {
            nombre_completo: true,
            apellido_completo: true,
          },
        },
      },
    });

    if (!comentario) {
      return null;
    }

    return new ConvenioComentario(
      comentario.id,
      comentario.convenio_id as number,
      comentario.usuario_id as number,
      comentario.comentario,
      comentario.fecha_creacion ?? new Date(),
      this.nombreUsuario(comentario.usuarios),
    );
  }

  async findByConvenio(convenioId: number): Promise<ConvenioComentario[]> {
    const comentarios = await this.prisma.convenio_comentarios.findMany({
      where: {
        convenio_id: convenioId,
      },
      orderBy: {
        fecha_creacion: 'desc',
      },
      include: {
        usuarios: {
          select: {
            nombre_completo: true,
            apellido_completo: true,
          },
        },
      },
    });

    return comentarios.map(
      (c) =>
        new ConvenioComentario(
          c.id,
          c.convenio_id as number,
          c.usuario_id as number,
          c.comentario,
          c.fecha_creacion ?? new Date(),
          this.nombreUsuario(c.usuarios),
        ),
    );
  }

  async delete(id: number): Promise<void> {
    await this.prisma.convenio_comentarios.delete({
      where: { id },
    });
  }

  private nombreUsuario(
    usuario?: {
      nombre_completo: string;
      apellido_completo: string;
    } | null,
  ): string | null {
    if (!usuario) {
      return null;
    }

    return `${usuario.nombre_completo ?? ''} ${
      usuario.apellido_completo ?? ''
    }`.trim();
  }
}
