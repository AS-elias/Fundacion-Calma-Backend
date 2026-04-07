import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { PrismaService } from './infrastructure/prisma/prisma.service';
import { ConveniosModule } from './modules/area-estrategia-desarrollo-comercial/convenios/convenios.module';
import { ConvenioComentariosModule } from './modules/area-estrategia-desarrollo-comercial/convenio_comentarios/convenio_comentarios.module';
import { ConvenioArchivosModule } from './modules/area-estrategia-desarrollo-comercial/convenio_archivos/convenio_archivos.module';
import { ComunidadModule } from './modules/Comunidad/comunidad.module';
import { PermisosService } from './core/services/permisos.service';
import { AreasService } from './core/services/areas.service';
import { ContratoCheckService } from './core/services/contrato-check.service';
import { ComunicacionesModule } from './modules/comunicaciones/comunicaciones.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    DashboardModule,
    ConveniosModule,
    ConvenioComentariosModule,
    ConvenioArchivosModule,
    ComunidadModule,
    ComunicacionesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    PermisosService,
    AreasService,
    ContratoCheckService,
  ],
  exports: [PrismaService, PermisosService, AreasService],
})
export class AppModule {}
