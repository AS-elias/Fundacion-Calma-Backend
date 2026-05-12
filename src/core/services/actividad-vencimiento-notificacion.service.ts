import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { NotificacionSistemaService } from '../../modules/notificaciones/application/services/notificacion-sistema.service';

type ActividadVencimiento = {
  id: number;
  titulo: string;
  fecha_limite: Date;
  tipo: 'desarrollo' | 'estrategia' | 'analisis';
  apartado: string;
  ruta: string;
};

@Injectable()
export class ActividadVencimientoNotificacionService implements OnModuleInit {
  private readonly logger = new Logger(ActividadVencimientoNotificacionService.name);
  private readonly diasAviso = 3;

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificacionSistema: NotificacionSistemaService,
  ) {}

  onModuleInit(): void {
    setTimeout(() => {
      void this.notificarActividadesPorVencer();
    }, 5000);
  }

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async notificarActividadesPorVencer(): Promise<void> {
    await this.ensureAlertasTable();

    const actividades = await this.obtenerActividadesPorVencer();
    let creadas = 0;

    for (const actividad of actividades) {
      const fecha = this.formatearFechaClave(actividad.fecha_limite);
      const inserted = await this.prisma.$queryRaw<{ inserted: number }[]>(Prisma.sql`
        INSERT INTO core.notificacion_alertas_actividad (
          tipo_actividad,
          actividad_id,
          fecha_limite,
          creado_at
        )
        VALUES (${actividad.tipo}, ${actividad.id}, ${fecha}::date, now())
        ON CONFLICT (tipo_actividad, actividad_id, fecha_limite) DO NOTHING
        RETURNING 1 AS inserted
      `);

      if (!inserted.length) {
        continue;
      }

      const diasRestantes = this.calcularDiasRestantes(actividad.fecha_limite);
      await this.notificacionSistema.registrar(
        'Actividad por vencer',
        [
          `La actividad "${actividad.titulo}" esta por vencer.`,
          `Fecha limite: ${this.formatearFechaVista(actividad.fecha_limite)}.`,
          diasRestantes === 0
            ? 'Vence hoy.'
            : `Faltan ${diasRestantes} dia${diasRestantes === 1 ? '' : 's'}.`,
        ].join('\n'),
        {
          apartado: actividad.apartado,
          accion: 'Aviso de vencimiento',
          automatico: true,
          ruta: actividad.ruta,
        },
      );

      creadas += 1;
    }

    if (creadas) {
      this.logger.log(`Notificaciones de actividades por vencer creadas: ${creadas}`);
    }
  }

  private async obtenerActividadesPorVencer(): Promise<ActividadVencimiento[]> {
    const inicio = this.inicioDia(new Date());
    const fin = new Date(inicio);
    fin.setDate(fin.getDate() + this.diasAviso);

    const [desarrollo, estrategia, analisis] = await Promise.all([
      this.prisma.desarrollo_actividades.findMany({
        where: {
          fecha_limite: {
            gte: inicio,
            lte: fin,
          },
          NOT: {
            estado: {
              in: ['COMPLETADO', 'FINALIZADO', 'PARALIZADO'],
              mode: 'insensitive',
            },
          },
        },
        select: {
          id: true,
          titulo: true,
          fecha_limite: true,
        },
      }),
      this.prisma.estrategia_actividades.findMany({
        where: {
          fecha_limite: {
            gte: inicio,
            lte: fin,
          },
          estado: {
            notIn: ['COMPLETADO', 'FINALIZADO', 'PARALIZADO'],
          },
        },
        select: {
          id: true,
          titulo: true,
          fecha_limite: true,
        },
      }),
      this.prisma.analisis_tareas.findMany({
        where: {
          fecha_limite: {
            gte: inicio,
            lte: fin,
          },
          NOT: {
            estado: {
              in: ['COMPLETADO', 'FINALIZADO', 'PARALIZADO'],
              mode: 'insensitive',
            },
          },
        },
        select: {
          id: true,
          titulo: true,
          fecha_limite: true,
        },
      }),
    ]);

    return [
      ...desarrollo
        .filter((actividad): actividad is typeof actividad & { fecha_limite: Date } => !!actividad.fecha_limite)
        .map((actividad) => ({
          ...actividad,
          tipo: 'desarrollo' as const,
          apartado: 'Desarrollo Comercial',
          ruta: '/dashboard/director-dashboard/desarrollo-comercial',
        })),
      ...estrategia
        .filter((actividad): actividad is typeof actividad & { fecha_limite: Date } => !!actividad.fecha_limite)
        .map((actividad) => ({
          ...actividad,
          tipo: 'estrategia' as const,
          apartado: 'Estrategia Comercial',
          ruta: '/dashboard/director-dashboard/estrategia-comercial',
        })),
      ...analisis
        .filter((actividad): actividad is typeof actividad & { fecha_limite: Date } => !!actividad.fecha_limite)
        .map((actividad) => ({
          ...actividad,
          tipo: 'analisis' as const,
          apartado: 'Analisis de Datos',
          ruta: '/dashboard/director-dashboard/analisis-datos',
        })),
    ];
  }

  private async ensureAlertasTable(): Promise<void> {
    await this.prisma.$executeRaw(Prisma.sql`
      CREATE TABLE IF NOT EXISTS core.notificacion_alertas_actividad (
        tipo_actividad VARCHAR(30) NOT NULL,
        actividad_id INTEGER NOT NULL,
        fecha_limite DATE NOT NULL,
        creado_at TIMESTAMP(6) DEFAULT now(),
        CONSTRAINT notificacion_alertas_actividad_pkey
          PRIMARY KEY (tipo_actividad, actividad_id, fecha_limite)
      )
    `);
  }

  private inicioDia(fecha: Date): Date {
    const inicio = new Date(fecha);
    inicio.setHours(0, 0, 0, 0);
    return inicio;
  }

  private calcularDiasRestantes(fechaLimite: Date): number {
    const hoy = this.inicioDia(new Date());
    const limite = this.inicioDia(fechaLimite);
    return Math.max(
      0,
      Math.ceil((limite.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)),
    );
  }

  private formatearFechaClave(fecha: Date): string {
    return fecha.toISOString().slice(0, 10);
  }

  private formatearFechaVista(fecha: Date): string {
    return fecha.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }
}
