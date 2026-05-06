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

  async getAdminStats() {
    const today = this.getTodayStart();

    const totalProyectos = await this.prisma.proyectos.count();

    const conveniosVigentes = await this.prisma.convenios.count({
      where: {
        OR: [{ estado: 'ACTIVO' }, { fecha_expiracion: { gte: today } }],
      },
    });

    const estadisticasTareasRaw = await this.prisma.estrategia_tareas.groupBy({
      by: ['estado'],
      _count: { id: true },
    });

    const estadisticasTareas = {
      pendientes: 0,
      planificacion: 0,
      ejecucion: 0,
      completadas: 0,
      otros: 0,
    };

    estadisticasTareasRaw.forEach((item) => {
      const estado = item.estado?.toUpperCase();
      if (estado === 'PENDIENTE')
        estadisticasTareas.pendientes += item._count.id;
      else if (estado === 'PLANIFICACION' || estado === 'EN PLANIFICACION')
        estadisticasTareas.planificacion += item._count.id;
      else if (estado === 'EJECUCION' || estado === 'EN EJECUCION')
        estadisticasTareas.ejecucion += item._count.id;
      else if (estado === 'COMPLETADA' || estado === 'COMPLETED')
        estadisticasTareas.completadas += item._count.id;
      else estadisticasTareas.otros += item._count.id;
    });

    const totalTareas =
      estadisticasTareas.pendientes +
      estadisticasTareas.planificacion +
      estadisticasTareas.ejecucion +
      estadisticasTareas.completadas +
      estadisticasTareas.otros;

    const desempenoEquipo =
      totalTareas > 0
        ? Math.round((estadisticasTareas.completadas / totalTareas) * 100)
        : 0;

    const estadisticasComunicacionesRaw = await this.prisma.convenios.groupBy({
      by: ['estado'],
      _count: { id: true },
    });

    const estadisticasComunicaciones = {
      negociacion: 0,
      firmados: 0,
      descartados: 0,
      otros: 0,
    };

    estadisticasComunicacionesRaw.forEach((item) => {
      const estado = item.estado?.toUpperCase();
      if (estado === 'EN NEGOCIACION' || estado === 'NEGOCIACION')
        estadisticasComunicaciones.negociacion += item._count.id;
      else if (estado === 'FIRMADO' || estado === 'ACTIVO')
        estadisticasComunicaciones.firmados += item._count.id;
      else if (estado === 'DESCARTADO')
        estadisticasComunicaciones.descartados += item._count.id;
      else estadisticasComunicaciones.otros += item._count.id;
    });

    const recentConvenios = await this.prisma.convenios.findMany({
      orderBy: { fecha_creacion: 'desc' },
      take: 5,
      select: {
        id: true,
        entidad_nombre: true,
        estado: true,
        creador_id: true,
        fecha_creacion: true,
      },
    });

    const recentTareas = await this.prisma.estrategia_tareas.findMany({
      orderBy: { fecha_creacion: 'desc' },
      take: 5,
      select: {
        id: true,
        titulo: true,
        estado: true,
        area_id: true,
        creador_id: true,
        fecha_creacion: true,
      },
    });

    const actividadReciente = [
      ...recentConvenios.map((c) => ({
        tipo: 'CONVENIO',
        mensaje: `Convenio ${c.entidad_nombre} (id=${c.id}) fue ${c.estado}`,
        fecha: c.fecha_creacion ?? new Date(0),
      })),
      ...recentTareas.map((t) => ({
        tipo: 'TAREA',
        mensaje: `Tarea ${t.titulo} (id=${t.id}) está en ${t.estado}`,
        fecha: t.fecha_creacion ?? new Date(0),
      })),
    ]
      .sort((a, b) => b.fecha.getTime() - a.fecha.getTime())
      .slice(0, 10);

    return {
      totalProyectos,
      conveniosVigentes,
      desempenoEquipo,
      actividadReciente,
      estadisticasTareas,
      estadisticasComunicaciones,
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

    const misProyectos = await this.prisma.proyectos.count({
      where: {
        OR: [
          { area_id: { in: allowedAreaIds } },
          { responsable_id: usuarioId },
        ],
      },
    });

    const misConvenios = await this.prisma.convenios.count({
      where: {
        AND: [
          {
            OR: [{ estado: 'ACTIVO' }, { fecha_expiracion: { gte: today } }],
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

    const tareasArea = await this.prisma.estrategia_tareas.groupBy({
      by: ['estado'],
      where: { area_id: { in: allowedAreaIds } },
      _count: { id: true },
    });

    const areaTotales = tareasArea.reduce((acc, x) => acc + x._count.id, 0);
    const areaCompletas =
      tareasArea.find(
        (x) =>
          x.estado?.toUpperCase() === 'COMPLETADA' ||
          x.estado?.toUpperCase() === 'COMPLETED',
      )?._count.id ?? 0;

    const desempenoEquipoArea =
      areaTotales > 0 ? Math.round((areaCompletas / areaTotales) * 100) : 0;

    const personalTotal = await this.prisma.estrategia_tareas.count({
      where: { asignado_a_id: usuarioId },
    });

    const personalCompletadas = await this.prisma.estrategia_tareas.count({
      where: {
        asignado_a_id: usuarioId,
        estado: 'COMPLETADA',
      },
    });

    const desempenoPersonal =
      personalTotal > 0
        ? Math.round((personalCompletadas / personalTotal) * 100)
        : 0;

    const misTareasRecientes = await this.prisma.estrategia_tareas.findMany({
      where: { asignado_a_id: usuarioId },
      orderBy: { fecha_creacion: 'desc' },
      take: 10,
      select: {
        id: true,
        titulo: true,
        estado: true,
        area_id: true,
        prioridad: true,
        fecha_creacion: true,
        fecha_vencimiento: true,
      },
    });

    const misAlertas = await this.prisma.estrategia_tareas.findMany({
      where: {
        asignado_a_id: usuarioId,
        OR: [{ prioridad: 'Alta' }, { fecha_vencimiento: { lt: today } }],
      },
      orderBy: { fecha_vencimiento: 'asc' },
      take: 10,
      select: {
        id: true,
        titulo: true,
        estado: true,
        area_id: true,
        prioridad: true,
        fecha_vencimiento: true,
      },
    });

    return {
      misProyectos,
      misConvenios,
      desempenoEquipoArea,
      desempenoPersonal,
      misTareasRecientes,
      misAlertas,
    };
  }
}
