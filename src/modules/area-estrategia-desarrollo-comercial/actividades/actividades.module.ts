import { Module } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { CreateActividadUseCase } from './application/use-cases/create-actividad.usecase';
import { GetActividadUseCase } from './application/use-cases/get-actividad.usecase';
import { GetActividadesUseCase } from './application/use-cases/get-actividades.usecase';
import { UpdateActividadUseCase } from './application/use-cases/update-actividad.usecase';
import { ActividadRepository } from './domain/repositories/actividad.repository';
import { ActividadesController } from './infrastructure/controllers/actividades.controller';
import { PrismaActividadRepository } from './infrastructure/repositories/prisma-actividad.repository';
import { NotificacionesModule } from '../../notificaciones/notificaciones.module';

@Module({
  imports: [NotificacionesModule],
  controllers: [ActividadesController],
  providers: [
    PrismaService,
    CreateActividadUseCase,
    GetActividadesUseCase,
    GetActividadUseCase,
    UpdateActividadUseCase,
    {
      provide: ActividadRepository,
      useClass: PrismaActividadRepository,
    },
  ],
})
export class ActividadesModule {}
