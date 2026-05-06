import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class ContratoCheckService {
  private readonly logger = new Logger(ContratoCheckService.name);

  constructor(private readonly prisma: PrismaService) {}

  // Todos los días a medianoche
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async desactivarUsuariosVencidos() {
    const hoy = new Date();

    const result = await this.prisma.usuarios.updateMany({
      where: {
        fecha_fin_contrato: {
          lt: hoy,
        },
        estado: 'ACTIVO',
      },
      data: {
        estado: 'INACTIVO',
      },
    });

    if (result.count) {
      this.logger.log(
        `Desactivados ${result.count} usuarios con contrato vencido`,
      );
    } else {
      this.logger.log('No se encontraron usuarios con contrato vencido');
    }
  }
}
