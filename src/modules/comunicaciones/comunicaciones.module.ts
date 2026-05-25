import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { ComunicacionesGateway } from './infrastructure/websockets/comunicaciones.gateway';
import { ComunicacionesService } from './application/services/comunicaciones.service';
import { COMUNICACIONES_REPOSITORY } from './domain/repositories/comunicaciones.repository';
import { PrismaComunicacionesRepository } from './infrastructure/repositories/prisma-comunicaciones.repository';
import { ComunicacionesController } from './presentation/controllers/comunicaciones.controller';
import { PresenceService } from '../../core/services/presence.service';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
    NotificacionesModule,
  ],
  controllers: [ComunicacionesController],
  providers: [
    PrismaService,
    ComunicacionesService,
    ComunicacionesGateway,
    PresenceService,
    {
      provide: COMUNICACIONES_REPOSITORY,
      useClass: PrismaComunicacionesRepository,
    },
  ],
  exports: [ComunicacionesGateway, ComunicacionesService],
})
export class ComunicacionesModule {}
