import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { NotificacionSistemaService } from './notificacion-sistema.service';
import { SystemGateway } from '../../../websockets/gateways/system.gateway';

@Injectable()
export class CumpleanosCronService {
  private readonly logger = new Logger(CumpleanosCronService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificacionSistema: NotificacionSistemaService,
    private readonly systemGateway: SystemGateway,
  ) {}

  // Se ejecutará todos los días a las 8:00 AM (0 8 * * *)
  @Cron('0 8 * * *', {
    name: 'cumpleanos-diarios',
    timeZone: 'America/Lima', // Se ajusta a la zona horaria de Perú, o se puede remover para usar la del servidor
  })
  async revisarCumpleanos() {
    this.logger.log('Iniciando proceso de revisión de cumpleaños...');
    
    try {
      const hoy = new Date();
      const mesActual = hoy.getMonth() + 1; // getMonth() es 0-11
      const diaActual = hoy.getDate();

      // Buscamos usuarios activos que tengan fecha de nacimiento
      const usuarios = await this.prisma.usuarios.findMany({
        where: {
          estado: 'ACTIVO',
          // @ts-ignore
          fecha_nacimiento: {
            not: null,
          },
        },
        select: {
          id: true,
          nombre_completo: true,
          // @ts-ignore
          fecha_nacimiento: true,
        },
      });

      const cumpleaneros = usuarios.filter((u: any) => {
        if (!u.fecha_nacimiento) return false;
        const fecha = new Date(u.fecha_nacimiento);
        return fecha.getMonth() + 1 === mesActual && fecha.getDate() === diaActual;
      });

      if (cumpleaneros.length === 0) {
        this.logger.log('Hoy no hay cumpleaños registrados.');
        return;
      }

      for (const user of cumpleaneros) {
        this.logger.log(`¡Feliz cumpleaños ${user.nombre_completo}! Emitiendo notificación...`);
        
        await this.notificacionSistema.registrar(
          '¡Hoy hay un Cumpleaños!',
          `¡Hoy es el cumpleaños de ${user.nombre_completo}! Felicidades.`,
          {
            automatico: true,
            apartado: 'comunidad',
          },
        );
      }

      // Emitir socket para que el frontend refresque las notificaciones
      this.systemGateway.emitSistemaActualizado('notificaciones', 'crear');
      
      this.logger.log(`Proceso de cumpleaños finalizado. Se felicitaron a ${cumpleaneros.length} usuarios.`);
    } catch (error) {
      this.logger.error('Error al procesar los cumpleaños diarios', error);
    }
  }
}
