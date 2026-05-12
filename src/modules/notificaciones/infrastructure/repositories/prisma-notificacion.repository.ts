import { Injectable } from '@nestjs/common';
import { NotificacionRepository } from '../../domain/repositories/notificacion.repository';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

@Injectable()
export class NotificacionPrismaRepository implements NotificacionRepository {

  constructor(
    private prisma: PrismaService
  ) {}

  async crear(data: any) {

    return this.prisma.notificaciones.create({
      data: {
        titulo: data.titulo,
        mensaje: data.mensaje,
        tipo: data.tipo,
        imagen: data.imagen,
        leido: false,
      },
    });
  }

  async listar(usuarioId?: number) {
    if (usuarioId) {
      const inicio = await this.prisma.notificacion_inicio_usuario.findUnique({
        where: { usuario_id: usuarioId },
      });

      const rows = await this.prisma.notificaciones.findMany({
        where: {
          OR: [
            { usuario_id: usuarioId },
            {
              usuario_id: null,
              ...(inicio?.fecha_ingreso
                ? { creado_at: { gte: inicio.fecha_ingreso } }
                : {}),
            },
          ],
          notificacion_eliminadas: {
            none: {
              usuario_id: usuarioId,
            },
          },
        },
        include: {
          notificacion_lecturas: {
            where: {
              usuario_id: usuarioId,
            },
            take: 1,
          },
        },
        orderBy: {
          creado_at: 'desc',
        },
      });

      return rows.map((row) => {
        const lectura = row.notificacion_lecturas[0];
        return this.mapRow(row, lectura?.leido, lectura?.favorito, lectura?.archivado);
      });
    }

    const rows = await this.prisma.notificaciones.findMany({
      orderBy: {
        creado_at: 'desc',
      },
    });

    return rows.map((row) => this.mapRow(row, row.leido, false, false));
  }

  async marcarLeido(id: number, leido: boolean, usuarioId?: number) {
    if (usuarioId) {
      await this.prisma.notificacion_lecturas.upsert({
        where: {
          notificacion_id_usuario_id: {
            notificacion_id: id,
            usuario_id: usuarioId,
          },
        },
        create: {
          notificacion_id: id,
          usuario_id: usuarioId,
          leido,
        },
        update: {
          leido,
          actualizado_at: new Date(),
        },
      });

      return this.findForUser(id, usuarioId);
    }

    return this.prisma.notificaciones.update({
      where: { id },
      data: { leido },
    });
  }

  async eliminar(id: number, usuarioId?: number) {
    if (usuarioId) {
      await this.prisma.notificacion_eliminadas.upsert({
        where: {
          notificacion_id_usuario_id: {
            notificacion_id: id,
            usuario_id: usuarioId,
          },
        },
        create: {
          notificacion_id: id,
          usuario_id: usuarioId,
        },
        update: {
          eliminado_at: new Date(),
        },
      });

      return this.prisma.notificaciones.findUnique({
        where: { id },
      });
    }

    return this.prisma.notificaciones.delete({
      where: { id },
    });
  }

  async actualizarPreferencia(
    id: number,
    usuarioId: number,
    data: { favorito?: boolean; archivado?: boolean },
  ) {
    await this.prisma.notificacion_lecturas.upsert({
      where: {
        notificacion_id_usuario_id: {
          notificacion_id: id,
          usuario_id: usuarioId,
        },
      },
      create: {
        notificacion_id: id,
        usuario_id: usuarioId,
        leido: false,
        favorito: data.favorito ?? false,
        archivado: data.archivado ?? false,
      },
      update: {
        ...(data.favorito !== undefined ? { favorito: data.favorito } : {}),
        ...(data.archivado !== undefined ? { archivado: data.archivado } : {}),
        actualizado_at: new Date(),
      },
    });

    return this.findForUser(id, usuarioId);
  }

  private async findForUser(id: number, usuarioId: number) {
    const row = await this.prisma.notificaciones.findUnique({
      where: { id },
      include: {
        notificacion_lecturas: {
          where: {
            usuario_id: usuarioId,
          },
          take: 1,
        },
      },
    });

    if (!row) {
      return null;
    }

    const lectura = row.notificacion_lecturas[0];
    return this.mapRow(row, lectura?.leido, lectura?.favorito, lectura?.archivado);
  }

  private mapRow(
    row: any,
    leido: boolean | null | undefined,
    favorito: boolean | null | undefined,
    archivado: boolean | null | undefined,
  ) {
    return {
      ...row,
      leido: Boolean(leido),
      favorito: Boolean(favorito),
      archivado: Boolean(archivado),
      tipo:
        row.tipo === 'sistema' || row.tipo === 'comunicados'
          ? row.tipo
          : 'sistema',
    };
  }

}
