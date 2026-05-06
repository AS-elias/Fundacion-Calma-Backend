import { Module } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { CreateAnalisisColegioUseCase } from '../analisis_colegios/application/use-cases/create-analisis-colegio.usecase';
import { DeleteAnalisisColegioUseCase } from '../analisis_colegios/application/use-cases/delete-analisis-colegio.usecase';
import { GetAnalisisColegioUseCase } from '../analisis_colegios/application/use-cases/get-analisis-colegio.usecase';
import { GetAnalisisColegiosUseCase } from '../analisis_colegios/application/use-cases/get-analisis-colegios.usecase';
import { UpdateAnalisisColegioUseCase } from '../analisis_colegios/application/use-cases/update-analisis-colegio.usecase';
import { AnalisisColegioRepository } from '../analisis_colegios/domain/repositories/analisis-colegio.repository';
import { AnalisisColegiosController } from '../analisis_colegios/infrastructure/controllers/analisis-colegios.controller';
import { PrismaAnalisisColegioRepository } from '../analisis_colegios/infrastructure/repositories/prisma-analisis-colegio.repository';
import { CreateAnalisisDifusionUseCase } from '../analisis_difusiones/application/use-cases/create-analisis-difusion.usecase';
import { DeleteAnalisisDifusionUseCase } from '../analisis_difusiones/application/use-cases/delete-analisis-difusion.usecase';
import { GetAnalisisDifusionUseCase } from '../analisis_difusiones/application/use-cases/get-analisis-difusion.usecase';
import { GetAnalisisDifusionesUseCase } from '../analisis_difusiones/application/use-cases/get-analisis-difusiones.usecase';
import { UpdateAnalisisDifusionUseCase } from '../analisis_difusiones/application/use-cases/update-analisis-difusion.usecase';
import { AnalisisDifusionRepository } from '../analisis_difusiones/domain/repositories/analisis-difusion.repository';
import { AnalisisDifusionesController } from '../analisis_difusiones/infrastructure/controllers/analisis-difusiones.controller';
import { PrismaAnalisisDifusionRepository } from '../analisis_difusiones/infrastructure/repositories/prisma-analisis-difusion.repository';
import { CreateAnalisisEmpresaUseCase } from '../analisis_empresas/application/use-cases/create-analisis-empresa.usecase';
import { DeleteAnalisisEmpresaUseCase } from '../analisis_empresas/application/use-cases/delete-analisis-empresa.usecase';
import { GetAnalisisEmpresaUseCase } from '../analisis_empresas/application/use-cases/get-analisis-empresa.usecase';
import { GetAnalisisEmpresasUseCase } from '../analisis_empresas/application/use-cases/get-analisis-empresas.usecase';
import { UpdateAnalisisEmpresaUseCase } from '../analisis_empresas/application/use-cases/update-analisis-empresa.usecase';
import { AnalisisEmpresaRepository } from '../analisis_empresas/domain/repositories/analisis-empresa.repository';
import { AnalisisEmpresasController } from '../analisis_empresas/infrastructure/controllers/analisis-empresas.controller';
import { PrismaAnalisisEmpresaRepository } from '../analisis_empresas/infrastructure/repositories/prisma-analisis-empresa.repository';
import { CreateAnalisisTareaEnlaceUseCase } from '../analisis_tarea_enlaces/application/use-cases/create-analisis-tarea-enlace.usecase';
import { DeleteAnalisisTareaEnlaceUseCase } from '../analisis_tarea_enlaces/application/use-cases/delete-analisis-tarea-enlace.usecase';
import { GetAnalisisTareaEnlacesUseCase } from '../analisis_tarea_enlaces/application/use-cases/get-analisis-tarea-enlaces.usecase';
import { UpdateAnalisisTareaEnlaceUseCase } from '../analisis_tarea_enlaces/application/use-cases/update-analisis-tarea-enlace.usecase';
import { AnalisisTareaEnlaceRepository } from '../analisis_tarea_enlaces/domain/repositories/analisis-tarea-enlace.repository';
import { AnalisisTareaEnlacesController } from '../analisis_tarea_enlaces/infrastructure/controllers/analisis-tarea-enlaces.controller';
import { PrismaAnalisisTareaEnlaceRepository } from '../analisis_tarea_enlaces/infrastructure/repositories/prisma-analisis-tarea-enlace.repository';
import { CreateAnalisisTareaUseCase } from '../analisis_tareas/application/use-cases/create-analisis-tarea.usecase';
import { DeleteAnalisisTareaUseCase } from '../analisis_tareas/application/use-cases/delete-analisis-tarea.usecase';
import { GetAnalisisTareaUseCase } from '../analisis_tareas/application/use-cases/get-analisis-tarea.usecase';
import { GetAnalisisTareasUseCase } from '../analisis_tareas/application/use-cases/get-analisis-tareas.usecase';
import { UpdateAnalisisTareaUseCase } from '../analisis_tareas/application/use-cases/update-analisis-tarea.usecase';
import { AnalisisTareaRepository } from '../analisis_tareas/domain/repositories/analisis-tarea.repository';
import { AnalisisTareasController } from '../analisis_tareas/infrastructure/controllers/analisis-tareas.controller';
import { PrismaAnalisisTareaRepository } from '../analisis_tareas/infrastructure/repositories/prisma-analisis-tarea.repository';
import { CreateAnalisisVenueUseCase } from '../analisis_venues/application/use-cases/create-analisis-venue.usecase';
import { DeleteAnalisisVenueUseCase } from '../analisis_venues/application/use-cases/delete-analisis-venue.usecase';
import { GetAnalisisVenueUseCase } from '../analisis_venues/application/use-cases/get-analisis-venue.usecase';
import { GetAnalisisVenuesUseCase } from '../analisis_venues/application/use-cases/get-analisis-venues.usecase';
import { UpdateAnalisisVenueUseCase } from '../analisis_venues/application/use-cases/update-analisis-venue.usecase';
import { AnalisisVenueRepository } from '../analisis_venues/domain/repositories/analisis-venue.repository';
import { AnalisisVenuesController } from '../analisis_venues/infrastructure/controllers/analisis-venues.controller';
import { PrismaAnalisisVenueRepository } from '../analisis_venues/infrastructure/repositories/prisma-analisis-venue.repository';

@Module({
  controllers: [
    AnalisisColegiosController,
    AnalisisEmpresasController,
    AnalisisVenuesController,
    AnalisisDifusionesController,
    AnalisisTareasController,
    AnalisisTareaEnlacesController,
  ],
  providers: [
    PrismaService,
    CreateAnalisisColegioUseCase,
    GetAnalisisColegiosUseCase,
    GetAnalisisColegioUseCase,
    UpdateAnalisisColegioUseCase,
    DeleteAnalisisColegioUseCase,
    {
      provide: AnalisisColegioRepository,
      useClass: PrismaAnalisisColegioRepository,
    },
    CreateAnalisisEmpresaUseCase,
    GetAnalisisEmpresasUseCase,
    GetAnalisisEmpresaUseCase,
    UpdateAnalisisEmpresaUseCase,
    DeleteAnalisisEmpresaUseCase,
    {
      provide: AnalisisEmpresaRepository,
      useClass: PrismaAnalisisEmpresaRepository,
    },
    CreateAnalisisVenueUseCase,
    GetAnalisisVenuesUseCase,
    GetAnalisisVenueUseCase,
    UpdateAnalisisVenueUseCase,
    DeleteAnalisisVenueUseCase,
    {
      provide: AnalisisVenueRepository,
      useClass: PrismaAnalisisVenueRepository,
    },
    CreateAnalisisDifusionUseCase,
    GetAnalisisDifusionesUseCase,
    GetAnalisisDifusionUseCase,
    UpdateAnalisisDifusionUseCase,
    DeleteAnalisisDifusionUseCase,
    {
      provide: AnalisisDifusionRepository,
      useClass: PrismaAnalisisDifusionRepository,
    },
    CreateAnalisisTareaUseCase,
    GetAnalisisTareasUseCase,
    GetAnalisisTareaUseCase,
    UpdateAnalisisTareaUseCase,
    DeleteAnalisisTareaUseCase,
    {
      provide: AnalisisTareaRepository,
      useClass: PrismaAnalisisTareaRepository,
    },
    CreateAnalisisTareaEnlaceUseCase,
    GetAnalisisTareaEnlacesUseCase,
    UpdateAnalisisTareaEnlaceUseCase,
    DeleteAnalisisTareaEnlaceUseCase,
    {
      provide: AnalisisTareaEnlaceRepository,
      useClass: PrismaAnalisisTareaEnlaceRepository,
    },
  ],
})
export class AnalisisDatosModule {}
