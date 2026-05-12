import { Module } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

import { NotificacionRepository } from './domain/repositories/notificacion.repository';
import { NotificacionPrismaRepository } from './infrastructure/repositories/prisma-notificacion.repository';
import { NotificacionesController } from './presentation/controllers/notificaciones.controller';

import { CrearNotificacionUseCase } from './application/use-cases/crear-notificacion.use-case';
import { ListarNotificacionesUseCase } from './application/use-cases/listar-notificaciones.use-case';
import { MarcarLeidoUseCase } from './application/use-cases/marcar-leido.use-case';
import { EliminarNotificacionUseCase } from './application/use-cases/eliminar-notificacion.use-case';

import { NotificacionStorageService } from './application/services/notificacion-storage.service';
import { NotificacionSistemaService } from './application/services/notificacion-sistema.service';

@Module({
  controllers: [NotificacionesController],
  providers: [
    PrismaService,

    NotificacionPrismaRepository,
    NotificacionStorageService,
    NotificacionSistemaService,

    {
      provide: NotificacionRepository,
      useClass: NotificacionPrismaRepository,
    },

    CrearNotificacionUseCase,
    ListarNotificacionesUseCase,
    MarcarLeidoUseCase,
    EliminarNotificacionUseCase,
  ],
  exports: [NotificacionSistemaService],
})
export class NotificacionesModule {}
