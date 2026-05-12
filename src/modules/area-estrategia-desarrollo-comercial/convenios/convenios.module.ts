import { Module } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

import { ConveniosController } from './infrastructure/controllers/convenios.controller';

import { CreateConvenioUseCase } from './application/use-cases/create-convenio.usecase';
import { GetConveniosUseCase } from './application/use-cases/get-convenios.usecase';
import { GetConvenioUseCase } from './application/use-cases/get-convenio.usecase';
import { UpdateConvenioUseCase } from './application/use-cases/update-convenio.usecase';
import { DeleteConvenioUseCase } from './application/use-cases/delete-convenio.usecase';

import { ConvenioRepository } from './domain/repositories/convenio.repository';
import { PrismaConvenioRepository } from './infrastructure/repositories/prisma-convenio.repository';
import { ConvenioHistorialModule } from '../convenio_historial/convenio_historial.module';
import { NotificacionesModule } from '../../notificaciones/notificaciones.module';

@Module({
  imports: [ConvenioHistorialModule, NotificacionesModule],
  controllers: [ConveniosController],

  providers: [
    PrismaService,

    CreateConvenioUseCase,
    GetConveniosUseCase,
    GetConvenioUseCase,
    UpdateConvenioUseCase,
    DeleteConvenioUseCase,

    {
      provide: ConvenioRepository,
      useClass: PrismaConvenioRepository,
    },
  ],
})
export class ConveniosModule {}
