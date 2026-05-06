import { Module } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { ConvenioHistorialService } from './application/services/convenio-historial.service';
import { ClearHistorialUseCase } from './application/use-cases/clear-historial.usecase';
import { GetHistorialUseCase } from './application/use-cases/get-historial.usecase';
import { HistorialController } from './infrastructure/controllers/historial.controller';
import { HistorialRepository } from './domain/repositories/historial.repository';
import { PrismaHistorialRepository } from './infrastructure/repositories/prisma-historial.repository';

@Module({
  controllers: [HistorialController],
  providers: [
    PrismaService,
    ConvenioHistorialService,
    ClearHistorialUseCase,
    GetHistorialUseCase,
    {
      provide: HistorialRepository,
      useClass: PrismaHistorialRepository,
    },
  ],
  exports: [ConvenioHistorialService],
})
export class ConvenioHistorialModule {}
