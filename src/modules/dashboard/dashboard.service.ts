import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import {
  DashboardAdminDto,
  DashboardUserDto,
} from './application/dto/dashboard-response.dto';

import { DashboardGateway } from './../websockets/gateways/dashboard.gateway';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly dashboardGateway: DashboardGateway,
  ) {}

  private getTodayStart() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }

  private getCurrentWeekStart() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const offsetToMonday = (dayOfWeek + 6) % 7;
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - offsetToMonday);
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
  }

  // Mapeo de estados de tareas a categorÃ­as estandarizadas
  private mapEstadoTarea(estado: string | null | undefined): string {
    if (!estado) return 'paralizado';
    const estadoUpper = estado.toUpperCase().trim().replace(/[-_]/g, ' ');
    if (estadoUpper === 'PENDIENTE') return 'pendientes';
    if (['EN REVISION', 'REVISION'].includes(estadoUpper)) return 'progreso';
    if (
      [
        'PROCESO',
        'EN PROCESO',
        'PLANIFICACION',
        'EN PLANIFICACION',
        'EN PROGRESO',
      ].includes(estadoUpper)
    )
      return 'progreso';
    if (['EJECUCION', 'EN EJECUCION'].includes(estadoUpper)) return 'ejecucion';
    if (
      [
        'COMPLETADA',
        'COMPLETED',
        'COMPLETADO',
        'FINALIZADO',
        'EN COMPLETADA',
        'EN FINALIZADO',
      ].includes(estadoUpper)
    )
      return 'completadas';
    if (
      ['PARALIZADO', 'PAUSADA', 'CANCELADA', 'SUSPENDIDA'].includes(estadoUpper)
    )
      return 'paralizado';

    return 'paralizado';
  }

  // Mapeo de estados de comunicaciones (convenios) a categorÃ­as estandarizadas
  private mapEstadoConvenio(estado: string | null | undefined): string {
    if (!estado) return 'cancelados';
    const estadoUpper = estado.toUpperCase().trim();
    if (['PENDIENTE', 'PROSPECTO'].includes(estadoUpper)) return 'pendiente';
    if (
      [
        'EN PROCESO',
        'EN_PROCESO',
        'EN NEGOCIACION',
        'EN_NEGOCIACION',
        'NEGOCIACION',
        'PROCESO DE CONVENIO',
        'PROCESO_DE_CONVENIO',
        'REUNIÃ“N AGENDADA',
        'REUNION AGENDADA',
        'REUNION_AGENDADA',
        'PROCESO CONVENIO',
        'EN PROCESO DE CONVENIO',
      ].includes(estadoUpper)
    )
      return 'proceso';
    if (
      [
        'CONVENIO FIRMADO',
        'CONVENIO_FIRMADO',
        'FIRMADO',
        'ACTIVO',
        'VIGENTE',
      ].includes(estadoUpper)
    )
      return 'firmados';
    if (
      ['DESCARTADO', 'CANCELADO', 'VENCIDO', 'RECHAZADO'].includes(estadoUpper)
    )
      return 'cancelados';

    return 'cancelados';
  }

  private async getCombinedTareaStats() {
    type EstadoCount = {
      estado: string | null | undefined;
      _count: { id: number };
    };

    const [desarrolloRaw, estrategiaRaw, analisisRaw] = await Promise.all([
      this.prisma.desarrollo_actividades.groupBy({
        by: ['estado'],
        _count: { id: true },
      }),
      this.prisma.estrategia_actividades.groupBy({
        by: ['estado'],
        _count: { id: true },
      }),
      this.prisma.analisis_tareas.groupBy({
        by: ['estado'],
        _count: { id: true },
      }),
    ]);

    const combined: EstadoCount[] = [
      ...desarrolloRaw,
      ...estrategiaRaw,
      ...analisisRaw,
    ];

    const estadisticasTareas = {
      pendientes: 0,
      progreso: 0,
      ejecucion: 0,
      completadas: 0,
      paralizado: 0,
    };

    combined.forEach((item) => {
      const categoria = this.mapEstadoTarea(item.estado);
      estadisticasTareas[categoria] += item._count?.id || 0;
    });

    return estadisticasTareas;
  }

  private async getEstrategiaActividadesStats(
    allowedAreaIds: number[],
    usuarioId?: number,
  ) {
    // El modelo actual `estrategia_actividades` no define un campo `area_id`.
    // Por eso, cuando el director consulta el dashboard, estos registros se cuentan
    // globalmente, igual que en el endpoint Admin.
    // Si se pasa usuarioId, filtramos por creado_por (para el User Dashboard).
    const result = await this.prisma.estrategia_actividades.groupBy({
      by: ['estado'],
      where: usuarioId ? { creado_por: String(usuarioId) } : undefined,
      _count: { id: true },
    });
    return result as any;
  }

  private async countEstrategiaActividades(
    allowedAreaIds: number[],
    usuarioId: number,
  ) {
    // El modelo actual `estrategia_actividades` no define un campo `area_id`.
    // Filtramos solo por creado_por.
    return this.prisma.estrategia_actividades.count({
      where: {
        creado_por: String(usuarioId),
      },
    });
  }

  async createDirectorEvaluation(
    directorId: number,
    usuarioId: number,
    rating: number,
    comentario?: string,
  ) {
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new Error('rating debe ser un entero entre 1 y 5');
    }
    if (directorId === usuarioId) {
      throw new Error('El director no puede evaluarse a sÃ­ mismo.');
    }

    const allowedAreaIds = await this.getAllowedAreaIds(directorId);
    if (allowedAreaIds.length === 0) {
      throw new Error(
        'El director no tiene Ã¡reas asignadas para evaluar usuarios.',
      );
    }

    const targetUser = await this.prisma.usuarios.findFirst({
      where: {
        id: usuarioId,
        estado: 'ACTIVO',
        roles: {
          nombre: {
            notIn: ['Director', 'Administrador'],
          },
        },
        permisos_area: {
          some: {
            area_id: { in: allowedAreaIds },
          },
        },
      },
      select: { id: true },
    });

    if (!targetUser) {
      throw new Error('Usuario no vÃ¡lido para evaluaciÃ³n del director.');
    }

    const weekStart = this.getCurrentWeekStart();

    let alreadyEvaluated: Array<{ id: number }> = [];
    try {
      alreadyEvaluated = await this.prisma.$queryRaw<Array<{ id: number }>>`
        SELECT id
        FROM core.director_evaluaciones
        WHERE director_id = ${directorId}
          AND usuario_id = ${usuarioId}
          AND created_at >= ${weekStart}
        LIMIT 1
      `;
    } catch (err: any) {
      if (!(err?.code === 'P2010' && err?.meta?.code === '42703')) {
        throw err;
      }
      // Columna usuario_id no existe en la BD; no podemos comprobar evaluaciones semanales.
      alreadyEvaluated = [];
    }

    if (alreadyEvaluated.length > 0) {
      throw new Error(
        'Este usuario ya fue evaluado por el director esta semana.',
      );
    }

    try {
      const [created] =
        (await this.prisma.$queryRaw<
          Array<{
            id: number;
            director_id: number | null;
            usuario_id: number | null;
            rating: number;
            comentario: string | null;
            created_at: Date;
          }>
        >`
        INSERT INTO core.director_evaluaciones (director_id, usuario_id, rating, comentario)
        VALUES (${directorId}, ${usuarioId}, ${rating}, ${comentario?.trim() || null})
        RETURNING id, director_id, usuario_id, rating, comentario, created_at
      `) || [];

      this.dashboardGateway.emitDashboardUpdated('evaluacion');
      return created;
    } catch (err: any) {
      if (!(err?.code === 'P2010' && err?.meta?.code === '42703')) {
        throw err;
      }
      // Fallback: tabla antigua sin usuario_id. Insertar sin usuario_id y devolver resultado bÃ¡sico.
      const [createdAlt] =
        (await this.prisma.$queryRaw<
          Array<{
            id: number;
            director_id: number | null;
            rating: number;
            comentario: string | null;
            created_at: Date;
          }>
        >`
        INSERT INTO core.director_evaluaciones (director_id, rating, comentario)
        VALUES (${directorId}, ${rating}, ${comentario?.trim() || null})
        RETURNING id, director_id, rating, comentario, created_at
      `) || [];

      this.dashboardGateway.emitDashboardUpdated('evaluacion');

      return {
        id: createdAlt?.id,
        director_id: createdAlt?.director_id ?? null,
        usuario_id: null,
        rating: createdAlt?.rating ?? rating,
        comentario: createdAlt?.comentario ?? null,
        created_at: createdAlt?.created_at ?? new Date(),
      };
    }
  }

  async getDirectorEvaluations(directorId: number) {
    try {
      return await this.prisma.$queryRaw<
        Array<{
          id: number;
          director_id: number | null;
          usuario_id: number | null;
          rating: number;
          comentario: string | null;
          created_at: Date;
          usuario_nombre: string | null;
          usuario_apellido: string | null;
        }>
      >`
        SELECT
          e.id,
          e.director_id,
          e.usuario_id,
          e.rating,
          e.comentario,
          e.created_at,
          u.nombre_completo AS usuario_nombre,
          u.apellido_completo AS usuario_apellido
        FROM core.director_evaluaciones e
        LEFT JOIN core.usuarios u ON u.id = e.usuario_id
        WHERE e.director_id = ${directorId}
        ORDER BY e.created_at DESC
      `;
    } catch (err: any) {
      if (!(err?.code === 'P2010' && err?.meta?.code === '42703')) {
        throw err;
      }
      // Fallback para esquemas antiguos sin usuario_id
      const rows = await this.prisma.$queryRaw<
        Array<{
          id: number;
          director_id: number | null;
          rating: number;
          comentario: string | null;
          created_at: Date;
        }>
      >`
        SELECT id, director_id, rating, comentario, created_at
        FROM core.director_evaluaciones
        WHERE director_id = ${directorId}
        ORDER BY created_at DESC
      `;

      return rows.map((r) => ({
        id: r.id,
        director_id: r.director_id,
        usuario_id: null,
        rating: r.rating,
        comentario: r.comentario,
        created_at: r.created_at,
        usuario_nombre: null,
        usuario_apellido: null,
      }));
    }
  }

  async getDirectorPendingUsers(directorId: number) {
    const allowedAreaIds = await this.getAllowedAreaIds(directorId);

    if (allowedAreaIds.length === 0) {
      return [];
    }

    const weekStart = this.getCurrentWeekStart();

    let evaluatedUserIds: number[] = [];
    try {
      const evaluatedThisWeek = await this.prisma.$queryRaw<
        Array<{ usuario_id: number | null }>
      >`
        SELECT DISTINCT usuario_id
        FROM core.director_evaluaciones
        WHERE director_id = ${directorId}
          AND usuario_id IS NOT NULL
          AND created_at >= ${weekStart}
      `;

      evaluatedUserIds = evaluatedThisWeek
        .map((item) => item.usuario_id)
        .filter((id): id is number => id !== null);
    } catch (err: any) {
      if (!(err?.code === 'P2010' && err?.meta?.code === '42703')) {
        throw err;
      }
      // Si la columna no existe, asumimos esquema antiguo: no hay evaluaciones por usuario.
      evaluatedUserIds = [];
    }

    const usuarios = await this.prisma.usuarios.findMany({
      where: {
        id: {
          not: directorId,
          ...(evaluatedUserIds.length ? { notIn: evaluatedUserIds } : {}),
        },
        estado: 'ACTIVO',
        roles: {
          nombre: {
            notIn: ['Director', 'Administrador'],
          },
        },
        permisos_area: {
          some: {
            area_id: { in: allowedAreaIds },
          },
        },
      },
      select: {
        id: true,
        nombre_completo: true,
        apellido_completo: true,
        email: true,
        roles: {
          select: {
            nombre: true,
          },
        },
      },
    });

    return usuarios.map((usuario) => ({
      id: usuario.id,
      nombre: `${usuario.nombre_completo} ${usuario.apellido_completo}`,
      email: usuario.email,
      rol: usuario.roles?.nombre ?? null,
    }));
  }

  private async getAllowedAreaIds(usuarioId: number) {
    const permisosArea = await this.prisma.permisos_area.findMany({
      where: { usuario_id: usuarioId },
      select: { area_id: true },
    });

    const initialAreaIds = permisosArea
      .map((permiso) => permiso.area_id)
      .filter((id): id is number => typeof id === 'number');

    if (initialAreaIds.length === 0) {
      return [];
    }

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

    const collected = new Set<number>();
    const stack = [...initialAreaIds];

    while (stack.length > 0) {
      const areaId = stack.pop()!;
      if (collected.has(areaId)) continue;
      collected.add(areaId);
      const children = childrenMap.get(areaId) ?? [];
      children.forEach((childId) => stack.push(childId));
    }

    return Array.from(collected);
  }

  async getAdminStats(): Promise<DashboardAdminDto> {
    const today = this.getTodayStart();

    const [
      totalProyectosDB,
      actividadCountDesarrollo,
      actividadCountEstrategia,
      actividadCountAnalisis,
    ] = await Promise.all([
      this.prisma.proyectos.count(),
      this.prisma.desarrollo_actividades.count(),
      this.prisma.estrategia_actividades.count(),
      this.prisma.analisis_tareas.count(),
    ]);

    const conveniosCount = await this.prisma.convenios.count();
    const empresasCount = await this.prisma.estrategia_empresas.count();
    const totalProyectos = totalProyectosDB + actividadCountDesarrollo + actividadCountEstrategia + actividadCountAnalisis + conveniosCount + empresasCount;

    const conveniosVigentes = await this.prisma.convenios.count({
      where: {
        OR: [
          { estado: 'CONVENIO FIRMADO' },
          { estado: 'FIRMADO' },
          { estado: 'ACTIVO' },
        ],
      },
    });

    const estadisticasTareas = await this.getCombinedTareaStats();

    const estadisticasComunicacionesRaw = await this.prisma.convenios.groupBy({
      by: ['estado'],
      _count: { id: true },
    });

    const estadisticasComunicaciones = {
      pendiente: 0,
      proceso: 0,
      firmados: 0,
      cancelados: 0,
    };

    estadisticasComunicacionesRaw.forEach((item) => {
      const categoria = this.mapEstadoConvenio(item.estado);
      estadisticasComunicaciones[categoria] += item._count.id;
    });

    // Obtener actividad reciente con informaciÃ³n del usuario
    const recentConvenios = await this.prisma.convenios.findMany({
      orderBy: { fecha_creacion: 'desc' },
      take: 5,
      select: {
        id: true,
        entidad_nombre: true,
        estado: true,
        usuarios: {
          select: {
            nombre_completo: true,
            apellido_completo: true,
          },
        },
        fecha_creacion: true,
      },
    });

    const recentTareas = await this.prisma.desarrollo_actividades.findMany({
      orderBy: { fecha_creacion: 'desc' },
      take: 5,
      select: {
        id: true,
        titulo: true,
        estado: true,
        usuarios: {
          select: {
            nombre_completo: true,
            apellido_completo: true,
          },
        },
        fecha_creacion: true,
      },
    });

    const recentAnalisis = await this.prisma.analisis_tareas.findMany({
      orderBy: { fecha_creacion: 'desc' },
      take: 5,
      select: {
        id: true,
        titulo: true,
        estado: true,
        usuarios: {
          select: { nombre_completo: true, apellido_completo: true },
        },
        fecha_creacion: true,
      },
    });

    const recentEstrategia = await this.prisma.estrategia_actividades.findMany({
      orderBy: { fecha_creacion: 'desc' },
      take: 5,
      select: {
        id: true,
        titulo: true,
        estado: true,
        creado_por: true,
        fecha_creacion: true,
      },
    });

    const mapActividad = (item: any, campoEntidad: string, tipo: string) => ({
      usuario: item.usuarios
        ? `${item.usuarios.nombre_completo} ${item.usuarios.apellido_completo}`
        : item.creado_por || 'Sistema',
      detalle: `actualiz\u00F3\u00F3 el estado a ${item.estado}`,
      entidad: item[campoEntidad],
      tipo,
      fecha: item.fecha_creacion ?? new Date(0),
    });

    const actividadReciente = [
      ...recentConvenios.map((c) =>
        mapActividad(c, 'entidad_nombre', 'CONVENIO'),
      ),
      ...recentTareas.map((t) =>
        mapActividad(t, 'titulo', 'ACTIVIDAD_DESARROLLO'),
      ),
      ...recentAnalisis.map((a) =>
        mapActividad(a, 'titulo', 'ACTIVIDAD_ANALISIS'),
      ),
      ...recentEstrategia.map((e) =>
        mapActividad(e, 'titulo', 'ACTIVIDAD_ESTRATEGIA'),
      ),
    ]
      .sort((a, b) => b.fecha.getTime() - a.fecha.getTime())
      .slice(0, 10);

    return {
      totalProyectos,
      proyectosRegistrados: totalProyectos,
      conveniosVigentes,
      actividadReciente,
      estadisticasTareas: { ...estadisticasTareas },
      estadisticasComunicaciones: { ...estadisticasComunicaciones },
    };
  }

  async getUserStats(usuarioId: number): Promise<DashboardUserDto> {
    const today = this.getTodayStart();

    const usuario = await this.prisma.usuarios.findUnique({
      where: { id: usuarioId },
      include: { roles: true },
    });
    const isStandardUser = usuario?.roles?.nombre === 'Usuario EstÃ¡ndar';

    const allowedAreaIds = await this.getAllowedAreaIds(usuarioId);
    const filterAreaIds = allowedAreaIds.length > 0 ? allowedAreaIds : [-1];

    // Usar nombres de Ã¡reas para determinar si mostrar o no ciertas mÃ©tricas (ej: convenios)
    const areasUsuario = await this.prisma.areas.findMany({
      where: { id: { in: filterAreaIds } },
      select: { nombre: true },
    });
    const nombresAreas = areasUsuario.map((a) => a.nombre.toLowerCase());
    const hasDesarrolloComercial = nombresAreas.some(
      (n) => n.includes('desarrollo') || n.includes('comercial'),
    );
    const hasEstrategia = nombresAreas.some((n) => n.includes('estrategia'));
    const hasAnalisis = nombresAreas.some(
      (n) => n.includes('anÃ¡lisis') || n.includes('analisis'),
    );

    let misProyectos = 0;
    if (hasDesarrolloComercial) {
      misProyectos += await this.prisma.convenios.count({ where: { OR: [{ area_id: { in: filterAreaIds } }, { creador_id: usuarioId }] } });
      misProyectos += await this.prisma.desarrollo_actividades.count({ where: { OR: [{ area_id: { in: filterAreaIds } }, { creador_id: usuarioId }] } });
    }
    if (hasAnalisis) {
      misProyectos += await this.prisma.analisis_tareas.count({ where: { OR: [{ area_id: { in: filterAreaIds } }, { creador_id: usuarioId }] } });
    }
    if (hasEstrategia) {
      misProyectos += await this.prisma.proyectos.count({ where: { OR: [{ area_id: { in: filterAreaIds } }, { responsable_id: usuarioId }] } });
      misProyectos += await this.prisma.estrategia_actividades.count({ where: { creado_por: String(usuarioId) } });
      misProyectos += await this.prisma.estrategia_empresas.count();
    }

    let misConvenios: number | null = null;
    if (hasDesarrolloComercial) {
      misConvenios = await this.prisma.convenios.count({
        where: {
          AND: [
            {
              OR: [
                { estado: 'CONVENIO FIRMADO' },
                { estado: 'FIRMADO' },
                { estado: 'ACTIVO' },
              ],
            },
            {
              OR: [
                { area_id: { in: filterAreaIds } },
                { creador_id: usuarioId },
              ],
            },
          ],
        },
      });
    }

    const estadisticasTareasRawDesarrollo =
      await this.prisma.desarrollo_actividades.groupBy({
        by: ['estado'],
        where: {
          OR: [{ area_id: { in: filterAreaIds } }, { creador_id: usuarioId }],
        },
        _count: { id: true },
      });

    const estadisticasTareasRawAnalisis =
      await this.prisma.analisis_tareas.groupBy({
        by: ['estado'],
        where: {
          OR: [{ area_id: { in: filterAreaIds } }, { creador_id: usuarioId }],
        },
        _count: { id: true },
      });

    const estadisticasTareasRawEstrategiaActividades = hasEstrategia
      ? await this.getEstrategiaActividadesStats(
          allowedAreaIds,
          isStandardUser ? usuarioId : undefined,
        )
      : [];

    const estadisticasTareas = {
      pendientes: 0,
      progreso: 0,
      ejecucion: 0,
      completadas: 0,
      paralizado: 0,
    };

    [
      ...estadisticasTareasRawDesarrollo,
      ...estadisticasTareasRawAnalisis,
      ...estadisticasTareasRawEstrategiaActividades,
    ].forEach((item) => {
      const categoria = this.mapEstadoTarea(item.estado);
      estadisticasTareas[categoria] += item._count?.id || 0;
    });

    const totalTareasArea = Object.values(estadisticasTareas).reduce(
      (a, b) => a + b,
      0,
    );
    const desempenoEquipo =
      totalTareasArea > 0
        ? Math.round((estadisticasTareas.completadas / totalTareasArea) * 100)
        : 0;

        let desempenoPersonal: number | null = null;
    let ultimaEvaluacion: { rating: number; comentario: string | null; created_at: Date } | null = null;
    try {
      const userEvaluations = await this.prisma.$queryRaw<
        Array<{ rating: number; comentario: string | null; created_at: Date }>
      >`
        SELECT rating, comentario, created_at FROM core.director_evaluaciones WHERE usuario_id = ${usuarioId} ORDER BY created_at DESC
      `;
      if (userEvaluations && userEvaluations.length > 0) {
        const sum = userEvaluations.reduce(
          (acc, curr) => acc + Number(curr.rating),
          0,
        );
        const avg = sum / userEvaluations.length;
        desempenoPersonal = Math.round((avg / 5) * 100);
        ultimaEvaluacion = userEvaluations[0];
      }
    } catch (err: any) {
      if (!(err?.code === 'P2010' && err?.meta?.code === '42703')) {
        throw err;
      }
      // Si la columna usuario_id no existe, no podemos calcular el desempeno personal
      desempenoPersonal = null;
    }

    const roleResult = await this.prisma.$queryRaw<
      Array<{ rol: string | null }>
    >`
      SELECT r.nombre AS rol
      FROM core.usuarios u
      LEFT JOIN core.roles r ON u.rol_id = r.id
      WHERE u.id = ${usuarioId}
      LIMIT 1
    `;

    const isDirector =
      roleResult[0]?.rol?.toString().toLowerCase() === 'director';
    let directorEvaluations: Array<{
      id: number;
      director_id: number | null;
      rating: number;
      comentario: string | null;
      created_at: Date;
    }> = [];
    let pendientesEvaluacion: Array<{
      id: number;
      nombre: string;
      email: string;
      rol: string | null;
    }> = [];
    let promedioEvaluacionDirector = 0;

    if (isDirector) {
      directorEvaluations = await this.getDirectorEvaluations(usuarioId);
      pendientesEvaluacion = await this.getDirectorPendingUsers(usuarioId);
      if (directorEvaluations.length > 0) {
        promedioEvaluacionDirector = Math.round(
          directorEvaluations.reduce(
            (sum, item) => sum + Number(item.rating),
            0,
          ) / directorEvaluations.length,
        );
      }
    }

    let estadisticasComunicaciones: any = null;
    if (hasDesarrolloComercial) {
      const estadisticasComunicacionesRaw = await this.prisma.convenios.groupBy(
        {
          by: ['estado'],
          where: {
            OR: [{ area_id: { in: filterAreaIds } }, { creador_id: usuarioId }],
          },
          _count: { id: true },
        },
      );

      estadisticasComunicaciones = {
        pendiente: 0,
        proceso: 0,
        firmados: 0,
        cancelados: 0,
      };

      estadisticasComunicacionesRaw.forEach((item) => {
        const categoria = this.mapEstadoConvenio(item.estado);
        estadisticasComunicaciones[categoria] += item._count.id;
      });
    }

    // Obtener actividad reciente con informaciÃ³n del usuario
    let recentConvenios: any[] = [];
    let recentTareas: any[] = [];
    let recentAnalisis: any[] = [];
    let recentEstrategia: any[] = [];

    // Para la actividad reciente, queremos mostrar lo que ocurre en toda el área (no solo lo propio)
    const baseWhereArea = {
      OR: [{ area_id: { in: filterAreaIds } }, { creador_id: usuarioId }],
    };

    if (hasDesarrolloComercial) {
      recentConvenios = await this.prisma.convenios.findMany({
        where: baseWhereArea,
        orderBy: { fecha_creacion: 'desc' },
        take: 5,
        select: {
          id: true,
          entidad_nombre: true,
          estado: true,
          usuarios: {
            select: { nombre_completo: true, apellido_completo: true },
          },
          fecha_creacion: true,
        },
      });

      recentTareas = await this.prisma.desarrollo_actividades.findMany({
        where: baseWhereArea,
        orderBy: { fecha_creacion: 'desc' },
        take: 5,
        select: {
          id: true,
          titulo: true,
          estado: true,
          usuarios: {
            select: { nombre_completo: true, apellido_completo: true },
          },
          fecha_creacion: true,
        },
      });
    }

    if (hasAnalisis) {
      recentAnalisis = await this.prisma.analisis_tareas.findMany({
        where: baseWhereArea,
        orderBy: { fecha_creacion: 'desc' },
        take: 5,
        select: {
          id: true,
          titulo: true,
          estado: true,
          usuarios: {
            select: { nombre_completo: true, apellido_completo: true },
          },
          fecha_creacion: true,
        },
      });
    }

    if (hasEstrategia) {
      const baseEstrategiaWhere = {};
      recentEstrategia = await this.prisma.estrategia_actividades.findMany({
        where: baseEstrategiaWhere,
        orderBy: { fecha_creacion: 'desc' },
        take: 5,
        select: {
          id: true,
          titulo: true,
          estado: true,
          creado_por: true,
          fecha_creacion: true,
        },
      });
    }

    const mapActividad = (item: any, campoEntidad: string, tipo: string) => ({
      usuario: item.usuarios
        ? `${item.usuarios.nombre_completo} ${item.usuarios.apellido_completo}`
        : item.creado_por || 'Sistema',
      detalle: `actualiz\u00F3\u00F3 el estado a ${item.estado}`,
      entidad: item[campoEntidad],
      tipo,
      fecha: item.fecha_creacion ?? new Date(0),
    });

    const actividadReciente = [
      ...recentConvenios.map((c) =>
        mapActividad(c, 'entidad_nombre', 'CONVENIO'),
      ),
      ...recentTareas.map((t) =>
        mapActividad(t, 'titulo', 'ACTIVIDAD_DESARROLLO'),
      ),
      ...recentAnalisis.map((a) =>
        mapActividad(a, 'titulo', 'ACTIVIDAD_ANALISIS'),
      ),
      ...recentEstrategia.map((e) =>
        mapActividad(e, 'titulo', 'ACTIVIDAD_ESTRATEGIA'),
      ),
    ]
      .sort((a, b) => b.fecha.getTime() - a.fecha.getTime())
      .slice(0, 10);

    return {
      misProyectos,
      totalProyectos: misProyectos,
      proyectosRegistrados: misProyectos,
      misConvenios,
      conveniosVigentes: misConvenios,
      desempenoEquipo,
      desempenoPersonal,
      ultimaEvaluacion,
      actividadReciente,
      estadisticasTareas: { ...estadisticasTareas },
      estadisticasComunicaciones: estadisticasComunicaciones
        ? { ...estadisticasComunicaciones }
        : null,
      directorEvaluations: directorEvaluations,
      promedioEvaluacionDirector,
      pendientesEvaluacion,
    };
  }
}
