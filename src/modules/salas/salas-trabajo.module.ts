import { Module } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { SalasTrabajoController } from './salas-trabajo.controller';
import { PrismaSalaRepository } from './infrastructure/repositories/prisma-sala.repository';
import { SALA_REPOSITORY } from './domain/repositories/sala.repository';
import { GetSalasUseCase } from './application/use-cases/get-salas.usecase';
import { GetSalaGeneralUseCase } from './application/use-cases/get-sala-general.usecase';
import { CreateSalaUseCase } from './application/use-cases/create-sala.usecase';
import { DeleteSalaUseCase } from './application/use-cases/delete-sala.usecase';

@Module({
  controllers: [SalasTrabajoController],
  providers: [
    PrismaService,
    {
      provide: SALA_REPOSITORY,
      useClass: PrismaSalaRepository,
    },
    GetSalasUseCase,
    GetSalaGeneralUseCase,
    CreateSalaUseCase,
    DeleteSalaUseCase,
  ],
})
export class SalasTrabajoModule {}