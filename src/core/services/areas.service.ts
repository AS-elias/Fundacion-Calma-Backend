import { Injectable, Inject } from '@nestjs/common';
import type { IUsuarioRepository } from '../../modules/auth/domain/repositories/usuario.repository';
import { USUARIO_REPOSITORY } from '../../modules/auth/domain/repositories/usuario.repository';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

export interface AreaConPermisos {
  id: number;
  nombre: string;
  padre_id?: number;
  es_externa?: boolean;
  permisos: {
    puede_publicar: boolean;
    puede_editar: boolean;
    permitir_subareas: boolean;
  };
  subareas?: AreaConPermisos[];
}

@Injectable()
export class AreasService {
  constructor(
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: IUsuarioRepository,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Obtiene todas las áreas a las que un usuario tiene acceso,
   * incluyendo permisos específicos y jerarquía de subáreas.
   */
  async obtenerAreasPermitidasParaUsuario(
    usuarioId: number,
    esDirector: boolean = false,
  ): Promise<AreaConPermisos[]> {
    // 1. Obtener todas las áreas para poder buscar subáreas recursivamente
    const todasAreasDb = await this.prisma.areas.findMany();

    // 2. Obtener permisos explícitos del usuario
    const permisosUsuario = await this.prisma.permisos_area.findMany({
      where: { usuario_id: usuarioId },
      include: { areas: true },
    });

    if (permisosUsuario.length === 0) {
      return [];
    }

    const areasMap = new Map<number, AreaConPermisos>();
    for (const area of todasAreasDb) {
      areasMap.set(area.id, {
        id: area.id,
        nombre: area.nombre,
        padre_id: area.padre_id || undefined,
        es_externa: area.es_externa || false,
        permisos: {
          puede_publicar: false,
          puede_editar: false,
          permitir_subareas: false,
        },
        subareas: [],
      });
    }

    // 3. Marcar las permitidas y recolectar
    const permitidasMap = new Map<number, AreaConPermisos>();

    for (const permiso of permisosUsuario) {
      if (!permiso.area_id) continue;

      const areaNode = areasMap.get(permiso.area_id);
      if (!areaNode) continue;

      areaNode.permisos.puede_publicar = permiso.puede_publicar || false;
      areaNode.permisos.puede_editar = permiso.puede_editar || false;
      areaNode.permisos.permitir_subareas = permiso.permitir_subareas || false;

      permitidasMap.set(areaNode.id, areaNode);

      // Si es director o tiene permitir_subareas en true, incluimos sus subareas jerárquicamente
      if (esDirector || areaNode.permisos.permitir_subareas) {
        this.agregarSubareasRecursivas(
          areaNode.id,
          areasMap,
          permitidasMap,
          areaNode.permisos,
        );
      }
    }

    // 4. Retornamos las raices relativas
    return this.construirArbolFiltrado(permitidasMap);
  }

  private agregarSubareasRecursivas(
    padreId: number,
    areasMap: Map<number, AreaConPermisos>,
    permitidasMap: Map<number, AreaConPermisos>,
    permisosHeredados: any,
  ) {
    for (const area of areasMap.values()) {
      if (area.padre_id === padreId) {
        if (!permitidasMap.has(area.id)) {
          area.permisos = { ...permisosHeredados };
          permitidasMap.set(area.id, area);
        }
        this.agregarSubareasRecursivas(
          area.id,
          areasMap,
          permitidasMap,
          permisosHeredados,
        );
      }
    }
  }

  private construirArbolFiltrado(
    permitidasMap: Map<number, AreaConPermisos>,
  ): AreaConPermisos[] {
    const raices: AreaConPermisos[] = [];

    for (const area of permitidasMap.values()) {
      // La limpiamos temporalmente por si quedan cosas viejas en la instancia
      area.subareas = [];
    }

    for (const area of permitidasMap.values()) {
      // Es raiz relativa si no tiene padre_id, O SI su padre_id no fue incluido en permitidasMap
      if (!area.padre_id || !permitidasMap.has(area.padre_id)) {
        raices.push(area);
      } else {
        // Si su padre está en permitidasMap, se lo agregamos
        const padre = permitidasMap.get(area.padre_id)!;
        if (!padre.subareas) padre.subareas = [];
        padre.subareas.push(area);
      }
    }
    return raices;
  }

  /**
   * Verifica si un usuario puede acceder a una área específica,
   * considerando la jerarquía (si tiene acceso al padre, puede ver subáreas).
   */
  async puedeAccederAreaCompleta(
    usuarioId: number,
    areaId: number,
  ): Promise<boolean> {
    // Verificar acceso directo
    const accesoDirecto =
      (await this.prisma.permisos_area.count({
        where: {
          usuario_id: usuarioId,
          area_id: areaId,
        },
      })) > 0;

    if (accesoDirecto) {
      return true;
    }

    // Verificar si tiene acceso a través de jerarquía (padre permite subáreas)
    const area = await this.prisma.areas.findUnique({
      where: { id: areaId },
    });

    if (!area?.padre_id) {
      return false; // No tiene padre, y no tiene acceso directo
    }

    const permisoPadre = await this.prisma.permisos_area.findUnique({
      where: {
        usuario_id_area_id: {
          usuario_id: usuarioId,
          area_id: area.padre_id,
        },
      },
    });

    return permisoPadre?.permitir_subareas ?? false;
  }

  async obtenerPermisosAreaUsuario(usuarioId: number) {
    return this.prisma.permisos_area.findMany({
      where: { usuario_id: usuarioId },
      select: {
        area_id: true,
        puede_publicar: true,
        puede_editar: true,
        permitir_subareas: true,
      },
    });
  }

  async actualizarPermisosAreaUsuario(
    usuarioId: number,
    permisos: {
      area_id: number;
      puede_publicar?: boolean;
      puede_editar?: boolean;
      permitir_subareas?: boolean;
    }[],
  ) {
    await this.prisma.permisos_area.deleteMany({
      where: { usuario_id: usuarioId },
    });

    if (!permisos || permisos.length === 0) {
      return { updated: 0 };
    }

    const data = permisos.map((permiso) => ({
      usuario_id: usuarioId,
      area_id: permiso.area_id,
      puede_publicar: permiso.puede_publicar ?? false,
      puede_editar: permiso.puede_editar ?? false,
      permitir_subareas: permiso.permitir_subareas ?? false,
    }));

    const result = await this.prisma.permisos_area.createMany({
      data,
      skipDuplicates: true,
    });

    return { updated: result.count };
  }

  /**
   * Obtiene todas las áreas disponibles (para admins),
   * o solo las permitidas para usuarios normales.
   */
  async obtenerAreasFiltradas(
    usuarioId: number,
    incluirTodas: boolean = false,
    esDirector: boolean = false,
  ): Promise<AreaConPermisos[]> {
    if (incluirTodas) {
      // Para admins: obtener todas las áreas con jerarquía
      const todasAreas = await this.prisma.areas.findMany({
        include: {
          other_areas: true,
        },
      });

      // Convertir a estructura jerárquica
      return this.construirJerarquiaAreas(todasAreas);
    } else {
      // Para usuarios normales y directores: solo áreas permitidas
      return this.obtenerAreasPermitidasParaUsuario(usuarioId, esDirector);
    }
  }

  private construirJerarquiaAreas(areasDb: any[]): AreaConPermisos[] {
    const areasMap = new Map<number, AreaConPermisos>();

    // Crear todas las áreas
    for (const area of areasDb) {
      areasMap.set(area.id, {
        id: area.id,
        nombre: area.nombre,
        padre_id: area.padre_id || undefined,
        es_externa: area.es_externa || false,
        permisos: {
          puede_publicar: true, // Asumir para admins
          puede_editar: true,
          permitir_subareas: true,
        },
        subareas: [],
      });
    }

    // Construir jerarquía
    const areasRaiz: AreaConPermisos[] = [];
    for (const area of areasMap.values()) {
      if (area.padre_id && areasMap.has(area.padre_id)) {
        areasMap.get(area.padre_id)!.subareas!.push(area);
      } else {
        areasRaiz.push(area);
      }
    }

    return areasRaiz;
  }
}
