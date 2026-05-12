import { Module } from '@nestjs/common';
import { ComunidadController } from './presentation/controllers/comunidad.controller';
import { GetContactosUseCase } from './application/use-cases/get-contactos.usecase';
import { AddContactoUseCase } from './application/use-cases/add-contacto.usecase';
import { SearchContactosUseCase } from './application/use-cases/search-contactos.usecase';
import { GetContactosAccesiblesUseCase } from './application/use-cases/get-contactos-accesibles.usecase';
import { EnviarSolicitudContactoUseCase } from './application/use-cases/enviar-solicitud-contacto.usecase';
import { AceptarSolicitudUseCase } from './application/use-cases/aceptar-solicitud.usecase';
import { RechazarSolicitudUseCase } from './application/use-cases/rechazar-solicitud.usecase';
import { ListarSolicitudesRecibidasUseCase } from './application/use-cases/listar-solicitudes-recibidas.usecase';
import { ListarSolicitudesEnviadasUseCase } from './application/use-cases/listar-solicitudes-enviadas.usecase';
import { PrismaComunidadRepository } from './infrastructure/repositories/prisma-comunidad.repository';
import { COMUNIDAD_REPOSITORY } from './domain/repositories/comunidad.repository';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { AreasService } from '../../core/services/areas.service';
import { PermisosService } from '../../core/services/permisos.service';
import { PresenceService } from '../../core/services/presence.service';
import { USUARIO_REPOSITORY } from '../auth/domain/repositories/usuario.repository';
import { UsuarioRepositoryImpl } from '../auth/infrastructure/repositories/usuario.repository.impl';
import { ComunicacionesModule } from '../comunicaciones/comunicaciones.module';

@Module({
  imports: [ComunicacionesModule],
  controllers: [ComunidadController],
  providers: [
    // 1. Casos de uso
    GetContactosUseCase,
    AddContactoUseCase,
    SearchContactosUseCase,
    GetContactosAccesiblesUseCase,
    EnviarSolicitudContactoUseCase,
    AceptarSolicitudUseCase,
    RechazarSolicitudUseCase,
    ListarSolicitudesRecibidasUseCase,
    ListarSolicitudesEnviadasUseCase,

    // 2. Servicios externos
    PrismaService,
    AreasService,
    PermisosService,
    PresenceService,

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
export class ComunidadModule { }
