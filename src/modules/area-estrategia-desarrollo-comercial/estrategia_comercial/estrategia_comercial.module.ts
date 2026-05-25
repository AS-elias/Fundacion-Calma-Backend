import { Module } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { CreateEstrategiaActividadEnlaceUseCase } from '../estrategia_actividad_enlaces/application/use-cases/create-estrategia-actividad-enlace.usecase';
import { DeleteEstrategiaActividadEnlaceUseCase } from '../estrategia_actividad_enlaces/application/use-cases/delete-estrategia-actividad-enlace.usecase';
import { GetEstrategiaActividadEnlaceUseCase } from '../estrategia_actividad_enlaces/application/use-cases/get-estrategia-actividad-enlace.usecase';
import { GetEstrategiaActividadEnlacesUseCase } from '../estrategia_actividad_enlaces/application/use-cases/get-estrategia-actividad-enlaces.usecase';
import { UpdateEstrategiaActividadEnlaceUseCase } from '../estrategia_actividad_enlaces/application/use-cases/update-estrategia-actividad-enlace.usecase';
import { EstrategiaActividadEnlaceRepository } from '../estrategia_actividad_enlaces/domain/repositories/estrategia-actividad-enlace.repository';
import { EstrategiaActividadEnlacesController } from '../estrategia_actividad_enlaces/infrastructure/controllers/estrategia-actividad-enlaces.controller';
import { PrismaEstrategiaActividadEnlaceRepository } from '../estrategia_actividad_enlaces/infrastructure/repositories/prisma-estrategia-actividad-enlace.repository';
import { CreateEstrategiaActividadUseCase } from '../estrategia_actividades/application/use-cases/create-estrategia-actividad.usecase';
import { DeleteEstrategiaActividadUseCase } from '../estrategia_actividades/application/use-cases/delete-estrategia-actividad.usecase';
import { GetEstrategiaActividadUseCase } from '../estrategia_actividades/application/use-cases/get-estrategia-actividad.usecase';
import { GetEstrategiaActividadesUseCase } from '../estrategia_actividades/application/use-cases/get-estrategia-actividades.usecase';
import { UpdateEstrategiaActividadUseCase } from '../estrategia_actividades/application/use-cases/update-estrategia-actividad.usecase';
import { EstrategiaActividadRepository } from '../estrategia_actividades/domain/repositories/estrategia-actividad.repository';
import { EstrategiaActividadesController } from '../estrategia_actividades/infrastructure/controllers/estrategia-actividades.controller';
import { PrismaEstrategiaActividadRepository } from '../estrategia_actividades/infrastructure/repositories/prisma-estrategia-actividad.repository';
import { CreateEstrategiaEmpresaUseCase } from '../estrategia_empresas/application/use-cases/create-estrategia-empresa.usecase';
import { DeleteEstrategiaEmpresaUseCase } from '../estrategia_empresas/application/use-cases/delete-estrategia-empresa.usecase';
import { GetEstrategiaEmpresaUseCase } from '../estrategia_empresas/application/use-cases/get-estrategia-empresa.usecase';
import { GetEstrategiaEmpresasUseCase } from '../estrategia_empresas/application/use-cases/get-estrategia-empresas.usecase';
import { UpdateEstrategiaEmpresaUseCase } from '../estrategia_empresas/application/use-cases/update-estrategia-empresa.usecase';
import { EstrategiaEmpresaRepository } from '../estrategia_empresas/domain/repositories/estrategia-empresa.repository';
import { EstrategiaEmpresasController } from '../estrategia_empresas/infrastructure/controllers/estrategia-empresas.controller';
import { PrismaEstrategiaEmpresaRepository } from '../estrategia_empresas/infrastructure/repositories/prisma-estrategia-empresa.repository';
import { CreateEstrategiaProyectoEnlaceUseCase } from '../estrategia_proyecto_enlaces/application/use-cases/create-estrategia-proyecto-enlace.usecase';
import { DeleteEstrategiaProyectoEnlaceUseCase } from '../estrategia_proyecto_enlaces/application/use-cases/delete-estrategia-proyecto-enlace.usecase';
import { GetEstrategiaProyectoEnlaceUseCase } from '../estrategia_proyecto_enlaces/application/use-cases/get-estrategia-proyecto-enlace.usecase';
import { GetEstrategiaProyectoEnlacesUseCase } from '../estrategia_proyecto_enlaces/application/use-cases/get-estrategia-proyecto-enlaces.usecase';
import { UpdateEstrategiaProyectoEnlaceUseCase } from '../estrategia_proyecto_enlaces/application/use-cases/update-estrategia-proyecto-enlace.usecase';
import { EstrategiaProyectoEnlaceRepository } from '../estrategia_proyecto_enlaces/domain/repositories/estrategia-proyecto-enlace.repository';
import { EstrategiaProyectoEnlacesController } from '../estrategia_proyecto_enlaces/infrastructure/controllers/estrategia-proyecto-enlaces.controller';
import { PrismaEstrategiaProyectoEnlaceRepository } from '../estrategia_proyecto_enlaces/infrastructure/repositories/prisma-estrategia-proyecto-enlace.repository';
import { CreateEstrategiaProyectoUseCase } from '../estrategia_proyectos/application/use-cases/create-estrategia-proyecto.usecase';
import { DeleteEstrategiaProyectoUseCase } from '../estrategia_proyectos/application/use-cases/delete-estrategia-proyecto.usecase';
import { GetEstrategiaProyectoUseCase } from '../estrategia_proyectos/application/use-cases/get-estrategia-proyecto.usecase';
import { GetEstrategiaProyectosUseCase } from '../estrategia_proyectos/application/use-cases/get-estrategia-proyectos.usecase';
import { UpdateEstrategiaProyectoUseCase } from '../estrategia_proyectos/application/use-cases/update-estrategia-proyecto.usecase';
import { EstrategiaProyectoRepository } from '../estrategia_proyectos/domain/repositories/estrategia-proyecto.repository';
import { EstrategiaProyectosController } from '../estrategia_proyectos/infrastructure/controllers/estrategia-proyectos.controller';
import { PrismaEstrategiaProyectoRepository } from '../estrategia_proyectos/infrastructure/repositories/prisma-estrategia-proyecto.repository';
import { NotificacionesModule } from '../../notificaciones/notificaciones.module';

@Module({
  imports: [NotificacionesModule],
  controllers: [
    EstrategiaActividadesController,
    EstrategiaActividadEnlacesController,
    EstrategiaEmpresasController,
    EstrategiaProyectosController,
    EstrategiaProyectoEnlacesController,
  ],
  providers: [
    PrismaService,
    CreateEstrategiaActividadUseCase,
    GetEstrategiaActividadesUseCase,
    GetEstrategiaActividadUseCase,
    UpdateEstrategiaActividadUseCase,
    DeleteEstrategiaActividadUseCase,
    CreateEstrategiaActividadEnlaceUseCase,
    GetEstrategiaActividadEnlacesUseCase,
    GetEstrategiaActividadEnlaceUseCase,
    UpdateEstrategiaActividadEnlaceUseCase,
    DeleteEstrategiaActividadEnlaceUseCase,
    CreateEstrategiaEmpresaUseCase,
    GetEstrategiaEmpresasUseCase,
    GetEstrategiaEmpresaUseCase,
    UpdateEstrategiaEmpresaUseCase,
    DeleteEstrategiaEmpresaUseCase,
    CreateEstrategiaProyectoUseCase,
    GetEstrategiaProyectosUseCase,
    GetEstrategiaProyectoUseCase,
    UpdateEstrategiaProyectoUseCase,
    DeleteEstrategiaProyectoUseCase,
    CreateEstrategiaProyectoEnlaceUseCase,
    GetEstrategiaProyectoEnlacesUseCase,
    GetEstrategiaProyectoEnlaceUseCase,
    UpdateEstrategiaProyectoEnlaceUseCase,
    DeleteEstrategiaProyectoEnlaceUseCase,
    {
      provide: EstrategiaActividadRepository,
      useClass: PrismaEstrategiaActividadRepository,
    },
    {
      provide: EstrategiaActividadEnlaceRepository,
      useClass: PrismaEstrategiaActividadEnlaceRepository,
    },
    {
      provide: EstrategiaEmpresaRepository,
      useClass: PrismaEstrategiaEmpresaRepository,
    },
    {
      provide: EstrategiaProyectoRepository,
      useClass: PrismaEstrategiaProyectoRepository,
    },
    {
      provide: EstrategiaProyectoEnlaceRepository,
      useClass: PrismaEstrategiaProyectoEnlaceRepository,
    },
  ],
})
export class EstrategiaComercialModule {}
