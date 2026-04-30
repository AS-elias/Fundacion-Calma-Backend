import { Injectable, Inject } from '@nestjs/common';
import type { IUsuarioRepository } from '../../modules/auth/domain/repositories/usuario.repository';
import { USUARIO_REPOSITORY } from '../../modules/auth/domain/repositories/usuario.repository';
import { RolesFundacion } from '../../modules/auth/domain/enums/roles.enum';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

export enum Acciones {
  AGREGAR_CONTACTO = 'agregar_contacto',
  EDITAR_CONTACTO = 'editar_contacto',
  ELIMINAR_CONTACTO = 'eliminar_contacto',
  VER_CONTACTOS = 'ver_contactos',
  GESTIONAR_AREAS = 'gestionar_areas',
  PUBLICAR_EN_AREA = 'publicar_en_area',
  EDITAR_EN_AREA = 'editar_en_area',
}

@Injectable()
export class PermisosService {
  constructor(
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: IUsuarioRepository,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Verifica si un usuario tiene permiso para realizar una acción específica.
   * Considera el rol global del usuario y sus permisos específicos por área.
   */
  async tienePermiso(
    usuarioId: number,
    accion: Acciones,
    areaId?: number,
  ): Promise<boolean> {
    // 1. Obtener información del usuario
    const usuario = await this.usuarioRepository.findById(usuarioId);
    if (!usuario || usuario.estado !== 'ACTIVO') {
      return false;
    }

    const rol = usuario.rol?.nombre as RolesFundacion;

    // 2. Verificar permisos basados en rol global (acciones que no requieren área específica)
    if (this.verificarPermisoPorRol(rol, accion)) {
      return true;
    }

    // 3. Si la acción requiere área específica, verificar permisos de área
    if (areaId && this.accionRequiereArea(accion)) {
      return await this.verificarPermisoEnArea(usuarioId, areaId, accion);
    }

    return false;
  }

  /**
   * Verifica permisos basados únicamente en el rol del usuario.
   */
  private verificarPermisoPorRol(
    rol: RolesFundacion,
    accion: Acciones,
  ): boolean {
    const permisosPorRol: Record<RolesFundacion, Acciones[]> = {
      [RolesFundacion.ADMIN]: [
        Acciones.AGREGAR_CONTACTO,
        Acciones.EDITAR_CONTACTO,
        Acciones.ELIMINAR_CONTACTO,
        Acciones.VER_CONTACTOS,
        Acciones.GESTIONAR_AREAS,
        Acciones.PUBLICAR_EN_AREA,
        Acciones.EDITAR_EN_AREA,
      ],
      [RolesFundacion.ADMINISTRADOR]: [
        Acciones.AGREGAR_CONTACTO,
        Acciones.EDITAR_CONTACTO,
        Acciones.ELIMINAR_CONTACTO,
        Acciones.VER_CONTACTOS,
        Acciones.PUBLICAR_EN_AREA,
        Acciones.EDITAR_EN_AREA,
      ],
      [RolesFundacion.DIRECTOR]: [
        Acciones.AGREGAR_CONTACTO,
        Acciones.EDITAR_CONTACTO,
        Acciones.VER_CONTACTOS,
        Acciones.PUBLICAR_EN_AREA,
        Acciones.GESTIONAR_AREAS, // <--- agregar aquí
      ],
      [RolesFundacion.COORDINADOR]: [
        Acciones.AGREGAR_CONTACTO,
        Acciones.VER_CONTACTOS,
        Acciones.PUBLICAR_EN_AREA,
      ],
      [RolesFundacion.PRACTICANTE]: [Acciones.VER_CONTACTOS],
    };

    return permisosPorRol[rol]?.includes(accion) ?? false;
  }

  /**
   * Verifica si una acción requiere especificar un área.
   */
  private accionRequiereArea(accion: Acciones): boolean {
    return [
      Acciones.PUBLICAR_EN_AREA,
      Acciones.EDITAR_EN_AREA,
      Acciones.GESTIONAR_AREAS,
    ].includes(accion);
  }

  /**
   * Verifica permisos específicos en un área.
   */
  private async verificarPermisoEnArea(
    usuarioId: number,
    areaId: number,
    accion: Acciones,
  ): Promise<boolean> {
    const permisoArea = await this.prisma.permisos_area.findUnique({
      where: {
        usuario_id_area_id: {
          usuario_id: usuarioId,
          area_id: areaId,
        },
      },
    });

    if (!permisoArea) {
      return false;
    }

    switch (accion) {
      case Acciones.PUBLICAR_EN_AREA:
        return permisoArea.puede_publicar ?? false;
      case Acciones.EDITAR_EN_AREA:
        return permisoArea.puede_editar ?? false;
      case Acciones.GESTIONAR_AREAS:
        // Solo si puede editar y tiene subáreas permitidas
        return (
          (permisoArea.puede_editar ?? false) &&
          (permisoArea.permitir_subareas ?? false)
        );
      default:
        return false;
    }
  }

  /**
   * Obtiene todas las áreas a las que un usuario tiene acceso.
   */
  async obtenerAreasPermitidas(usuarioId: number): Promise<number[]> {
    const permisos = await this.prisma.permisos_area.findMany({
      where: { usuario_id: usuarioId },
      select: { area_id: true },
    });

    return permisos.map((p) => p.area_id).filter((id) => id !== null);
  }

  /**
   * Verifica si un usuario puede acceder a una área específica.
   */
  async puedeAccederArea(usuarioId: number, areaId: number): Promise<boolean> {
    const count = await this.prisma.permisos_area.count({
      where: {
        usuario_id: usuarioId,
        area_id: areaId,
      },
    });

    return count > 0;
  }
}
