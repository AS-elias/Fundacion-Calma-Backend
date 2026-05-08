import { Module } from '@nestjs/common';
import { ComunidadController } from './presentation/controllers/comunidad.controller';
import { GetContactosUseCase } from './application/use-cases/get-contactos.usecase';
import { AddContactoUseCase } from './application/use-cases/add-contacto.usecase';
import { SearchContactosUseCase } from './application/use-cases/search-contactos.usecase';
import { PrismaComunidadRepository } from './infrastructure/repositories/prisma-comunidad.repository';
import { COMUNIDAD_REPOSITORY } from './domain/repositories/comunidad.repository';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { AreasService } from '../../core/services/areas.service';
import { PermisosService } from '../../core/services/permisos.service';
import { USUARIO_REPOSITORY } from '../auth/domain/repositories/usuario.repository';
import { UsuarioRepositoryImpl } from '../auth/infrastructure/repositories/usuario.repository.impl';

@Module({
  controllers: [ComunidadController],
  providers: [
    // 1. Casos de uso
    GetContactosUseCase,
    AddContactoUseCase,
    SearchContactosUseCase,

    // 2. Servicios externos
    PrismaService,
    AreasService,
    PermisosService,

    // 3. Inyección de dependencias (Arquitectura Hexagonal)
    {
      provide: COMUNIDAD_REPOSITORY,
      useClass: PrismaComunidadRepository,
    },
    {
      provide: USUARIO_REPOSITORY,
      useClass: UsuarioRepositoryImpl,
    },
  ],
  exports: [],
})
export class ComunidadModule {}
