import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  private getTodayStart() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }

  // Mapeo de estados de tareas a categorías estandarizadas
  private mapEstadoTarea(estado: string | null | undefined): string {
    if (!estado) return 'paralizado';
    const estadoUpper = estado.toUpperCase().trim();
    if (estadoUpper === 'PENDIENTE') return 'pendientes';
    if (['EN REVISION', 'REVISION', 'EN_REVISION'].includes(estadoUpper)) return 'progreso';
    if (['PROCESO', 'EN PROCESO', 'EN_PROCESO', 'PLANIFICACION', 'EN PLANIFICACION', 'EN_PLANIFICACION', 'EN PROGRESO', 'EN_PROGRESO'].includes(estadoUpper)) return 'progreso';
    if (['EJECUCION', 'EN EJECUCION', 'EN_EJECUCION'].includes(estadoUpper)) return 'ejecucion';
    if (['COMPLETADA', 'COMPLETED', 'COMPLETADO', 'FINALIZADO', 'EN_COMPLETADA', 'EN FINALIZADO', 'EN_FINALIZADO'].includes(estadoUpper)) return 'completadas';
    if (['PARALIZADO', 'PAUSADA', 'CANCELADA', 'SUSPENDIDA'].includes(estadoUpper)) return 'paralizado';
    
    return 'paralizado';
  }

  // Mapeo de estados de comunicaciones (convenios) a categorías estandarizadas
  private mapEstadoConvenio(estado: string | null | undefined): string {
    if (!estado) return 'cancelados';
    const estadoUpper = estado.toUpperCase().trim();
    if (['PENDIENTE', 'PROSPECTO'].includes(estadoUpper)) return 'pendiente';
    if (['EN PROCESO', 'EN_PROCESO', 'EN NEGOCIACION', 'EN_NEGOCIACION', 'NEGOCIACION', 'PROCESO DE CONVENIO', 'PROCESO_DE_CONVENIO', 'REUNIÓN AGENDADA', 'REUNION AGENDADA', 'REUNION_AGENDADA', 'PROCESO CONVENIO', 'EN PROCESO DE CONVENIO'].includes(estadoUpper)) return 'proceso';
    if (['CONVENIO FIRMADO', 'CONVENIO_FIRMADO', 'FIRMADO', 'ACTIVO', 'VIGENTE'].includes(estadoUpper)) return 'firmados';
    if (['DESCARTADO', 'CANCELADO', 'VENCIDO', 'RECHAZADO'].includes(estadoUpper)) return 'cancelados';
    
    return 'cancelados';
  }

  private async getCombinedTareaStats() {
    type EstadoCount = { estado: string | null | undefined; _count: { id: number } };

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

    const combined: EstadoCount[] = [...desarrolloRaw, ...estrategiaRaw, ...analisisRaw];

    const estadisticasTareas = {
      pendientes: 0,
      progreso: 0,
      ejecucion: 0,
      completadas: 0,
      paralizado: 0,
    };

    combined.forEach((item) => {
      const categoria = this.mapEstadoTarea(item.estado);
      estadisticasTareas[categoria] += item._count.id;
    });

    return estadisticasTareas;
  }

  async createDirectorEvaluation(directorId: number, rating: number, comentario?: string) {
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new Error('rating debe ser un entero entre 1 y 5');
    }

    const [created] = (await this.prisma.$queryRaw<
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

    return created;
  }

  async getDirectorEvaluations(directorId: number) {
    return this.prisma.$queryRaw<
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
  }

  async getAdminStats() {
    const today = this.getTodayStart();

    const [totalProyectosDB, actividadCountDesarrollo, actividadCountEstrategia, actividadCountAnalisis] = await Promise.all([
      this.prisma.proyectos.count(),
      this.prisma.desarrollo_actividades.count(),
      this.prisma.estrategia_actividades.count(),
      this.prisma.analisis_tareas.count(),
    ]);

    const totalProyectos = totalProyectosDB > 0 ? totalProyectosDB : actividadCountDesarrollo + actividadCountEstrategia + actividadCountAnalisis;

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

    // Obtener actividad reciente con información del usuario
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

    const actividadReciente = [
      ...recentConvenios.map((c) => ({
        usuario: c.usuarios
          ? `${c.usuarios.nombre_completo} ${c.usuarios.apellido_completo}`
          : 'Sistema',
        detalle: `actualizó el estado a ${c.estado}`,
        entidad: c.entidad_nombre,
        tipo: 'CONVENIO',
        fecha: c.fecha_creacion ?? new Date(0),
      })),
      ...recentTareas.map((t) => ({
        usuario: t.usuarios
          ? `${t.usuarios.nombre_completo} ${t.usuarios.apellido_completo}`
          : 'Sistema',
        detalle: `actualizó el estado a ${t.estado}`,
        entidad: t.titulo,
        tipo: 'ACTIVIDAD',
        fecha: t.fecha_creacion ?? new Date(0),
      })),
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

  async getUserStats(usuarioId: number) {
    const today = this.getTodayStart();

    const permisosArea = await this.prisma.permisos_area.findMany({
      where: { usuario_id: usuarioId },
    });

    const areaIds = permisosArea
      .map((p) => p.area_id)
      .filter((id): id is number => typeof id === 'number');

    const allowedAreaIds = areaIds.length > 0 ? areaIds : [-1];
    
    const misProyectos = await this.prisma.desarrollo_actividades.count({
      where: {
        OR: [
          { area_id: { in: allowedAreaIds } },
          { creador_id: usuarioId },
        ],
      },
    });
    
    const misConvenios = await this.prisma.convenios.count({
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
              { area_id: { in: allowedAreaIds } },
              { creador_id: usuarioId },
            ],
          },
        ],
      },
    });
    
    const estadisticasTareasRaw = await this.prisma.desarrollo_actividades.groupBy({
      by: ['estado'],
      where: {
        OR: [
          { area_id: { in: allowedAreaIds } },
          { creador_id: usuarioId },
        ],
      },
      _count: { id: true },
    });

    const estadisticasTareas = {
      pendientes: 0,
      progreso: 0,
      ejecucion: 0,
      completadas: 0,
      paralizado: 0,
    };

    estadisticasTareasRaw.forEach((item) => {
      const categoria = this.mapEstadoTarea(item.estado);
      estadisticasTareas[categoria] += item._count.id;
    });

    const totalTareasArea = Object.values(estadisticasTareas).reduce((a, b) => a + b, 0);
    const desempenoEquipo = totalTareasArea > 0 ? Math.round((estadisticasTareas.completadas / totalTareasArea) * 100) : 0;
    
    const personalTotal = await this.prisma.desarrollo_actividades.count({
      where: { creador_id: usuarioId },
    });

    const personalCompletadas = await this.prisma.desarrollo_actividades.count({
      where: {
        creador_id: usuarioId,
        estado: 'COMPLETADO',
      },
    });

    const desempenoPersonal =
      personalTotal > 0
        ? Math.round((personalCompletadas / personalTotal) * 100)
        : 0;

    const roleResult = await this.prisma.$queryRaw<
      Array<{ rol: string | null }>
    >`
      SELECT r.nombre AS rol
      FROM core.usuarios u
      LEFT JOIN core.roles r ON u.rol_id = r.id
      WHERE u.id = ${usuarioId}
      LIMIT 1
    `;

    const isDirector = roleResult[0]?.rol?.toString().toLowerCase() === 'director';
    let directorEvaluations: Array<{
      id: number;
      director_id: number | null;
      rating: number;
      comentario: string | null;
      created_at: Date;
    }> = [];
    let promedioEvaluacionDirector = 0;

    if (isDirector) {
      directorEvaluations = await this.getDirectorEvaluations(usuarioId);
      if (directorEvaluations.length > 0) {
        promedioEvaluacionDirector = Math.round(
          directorEvaluations.reduce((sum, item) => sum + Number(item.rating), 0) /
            directorEvaluations.length,
        );
      }
    }

    const estadisticasComunicacionesRaw = await this.prisma.convenios.groupBy({
      by: ['estado'],
      where: {
        OR: [
          { area_id: { in: allowedAreaIds } },
          { creador_id: usuarioId },
        ],
      },
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

    // Obtener actividad reciente con información del usuario
    const recentConvenios = await this.prisma.convenios.findMany({
      where: {
        OR: [
          { area_id: { in: allowedAreaIds } },
          { creador_id: usuarioId },
        ],
      },
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
      where: {
        OR: [
          { area_id: { in: allowedAreaIds } },
          { creador_id: usuarioId },
        ],
      },
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

    const actividadReciente = [
      ...recentConvenios.map((c) => ({
        usuario: c.usuarios
          ? `${c.usuarios.nombre_completo} ${c.usuarios.apellido_completo}`
          : 'Sistema',
        detalle: `actualizó el estado a ${c.estado}`,
        entidad: c.entidad_nombre,
        tipo: 'CONVENIO',
        fecha: c.fecha_creacion ?? new Date(0),
      })),
      ...recentTareas.map((t) => ({
        usuario: t.usuarios
          ? `${t.usuarios.nombre_completo} ${t.usuarios.apellido_completo}`
          : 'Sistema',
        detalle: `actualizó el estado a ${t.estado}`,
        entidad: t.titulo,
        tipo: 'ACTIVIDAD',
        fecha: t.fecha_creacion ?? new Date(0),
      })),
    ]
      .sort((a, b) => b.fecha.getTime() - a.fecha.getTime())
      .slice(0, 10);

    return {
      misProyectos,
      misConvenios,
      desempenoEquipo,
      desempenoPersonal,
      actividadReciente,
      estadisticasTareas: { ...estadisticasTareas },
      estadisticasComunicaciones: { ...estadisticasComunicaciones },
      directorEvaluations: directorEvaluations,
      promedioEvaluacionDirector,
    };
  }
}
