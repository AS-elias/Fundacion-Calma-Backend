import { Injectable } from '@nestjs/common';
import { NotificacionRepository } from '../../domain/repositories/notificacion.repository';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';

@Injectable()
export class NotificacionPrismaRepository implements NotificacionRepository {
  constructor(private prisma: PrismaService) {}

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

  private async getAllowedAreaIds(usuarioId: number): Promise<number[]> {
    const permisosArea = await this.prisma.permisos_area.findMany({
      where: { usuario_id: usuarioId },
      select: { area_id: true },
    });

    const initialAreaIds = permisosArea
      .map((p) => p.area_id)
      .filter((id): id is number => typeof id === 'number');

    if (initialAreaIds.length === 0) return [];

    const allAreas = await this.prisma.areas.findMany({
      select: { id: true, padre_id: true },
    });
    const childrenMap = new Map<number, number[]>();
    allAreas.forEach((area) => {
      if (area.padre_id) {
        const current = childrenMap.get(area.padre_id) ?? [];
        current.push(area.id);
        childrenMap.set(area.padre_id, current);
      }
    });

    const result = new Set<number>();
    const stack = [...initialAreaIds];
    while (stack.length > 0) {
      const currentId = stack.pop()!;
      if (!result.has(currentId)) {
        result.add(currentId);
        const children = childrenMap.get(currentId) ?? [];
        stack.push(...children);
      }
    }
    return Array.from(result);
  }

  async listar(actualUserId: number, rol: string, queryUserId?: number) {
    const targetUserId = queryUserId ?? actualUserId;

    const inicio = await this.prisma.notificacion_inicio_usuario.findUnique({
      where: { usuario_id: targetUserId },
    });

    const globalFilters: any[] = [];
    if (rol === 'Administrador' || rol === 'Admin') {
      globalFilters.push({ usuario_id: null });
    } else {
      globalFilters.push({ usuario_id: null, tipo: 'comunicados' });

      const allowedAreaIds = await this.getAllowedAreaIds(actualUserId);
      if (allowedAreaIds.length > 0) {
        const areasUsuario = await this.prisma.areas.findMany({
          where: { id: { in: allowedAreaIds } },
          select: { nombre: true },
        });
        const nombresAreas = areasUsuario.map((a) => a.nombre.toLowerCase());
        const hasDesarrollo = nombresAreas.some(
          (n) => n.includes('desarrollo') || n.includes('comercial'),
        );
        const hasEstrategia = nombresAreas.some((n) =>
          n.includes('estrategia'),
        );
        const hasAnalisis = nombresAreas.some(
          (n) => n.includes('análisis') || n.includes('analisis'),
        );

        const areaConditions: any[] = [];
        if (hasDesarrollo) {
          areaConditions.push({
            mensaje: { contains: 'Desarrollo', mode: 'insensitive' },
          });
          areaConditions.push({
            mensaje: { contains: 'Convenio', mode: 'insensitive' },
          });
        }
        if (hasEstrategia) {
          areaConditions.push({
            mensaje: { contains: 'Estrategia', mode: 'insensitive' },
          });
        }
        if (hasAnalisis) {
          areaConditions.push({
            mensaje: { contains: 'Analisis', mode: 'insensitive' },
          });
          areaConditions.push({
            mensaje: { contains: 'Análisis', mode: 'insensitive' },
          });
        }

        if (areaConditions.length > 0) {
          globalFilters.push({
            usuario_id: null,
            tipo: 'sistema',
            OR: areaConditions,
          });
        }
      }
    }

    const rows = await this.prisma.notificaciones.findMany({
      where: {
        OR: [
          { usuario_id: targetUserId },
          ...globalFilters.map((filter) => ({
            ...filter,
            ...(inicio?.fecha_ingreso
              ? { creado_at: { gte: inicio.fecha_ingreso } }
              : {}),
          })),
        ],
        notificacion_eliminadas: {
          none: { usuario_id: targetUserId },
        },
      },
      include: {
        notificacion_lecturas: {
          where: { usuario_id: targetUserId },
          take: 1,
        },
      },
      orderBy: { creado_at: 'desc' },
    });

    return rows.map((row) => {
      const lectura = row.notificacion_lecturas[0];
      return this.mapRow(
        row,
        lectura?.leido,
        lectura?.favorito,
        lectura?.archivado,
      );
    });
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
    return this.mapRow(
      row,
      lectura?.leido,
      lectura?.favorito,
      lectura?.archivado,
    );
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
