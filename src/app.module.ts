import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { PrismaService } from './infrastructure/prisma/prisma.service';
import { ActividadesModule } from './modules/area-estrategia-desarrollo-comercial/actividades/actividades.module';
import { ConveniosModule } from './modules/area-estrategia-desarrollo-comercial/convenios/convenios.module';
import { ConvenioComentariosModule } from './modules/area-estrategia-desarrollo-comercial/convenio_comentarios/convenio_comentarios.module';
import { ConvenioArchivosModule } from './modules/area-estrategia-desarrollo-comercial/convenio_archivos/convenio_archivos.module';
import { ConvenioHistorialModule } from './modules/area-estrategia-desarrollo-comercial/convenio_historial/convenio_historial.module';
import { AnalisisDatosModule } from './modules/area-estrategia-desarrollo-comercial/analisis_datos/analisis_datos.module';
import { EstrategiaComercialModule } from './modules/area-estrategia-desarrollo-comercial/estrategia_comercial/estrategia_comercial.module';
import { ComunidadModule } from './modules/Comunidad/comunidad.module';
import { PermisosService } from './core/services/permisos.service';
import { AreasService } from './core/services/areas.service';
import { ContratoCheckService } from './core/services/contrato-check.service';
import { ActividadVencimientoNotificacionService } from './core/services/actividad-vencimiento-notificacion.service';
import { NotificacionesModule } from './modules/notificaciones/notificaciones.module';
import { RepositorioModule } from './modules/repositorio/repositorio.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    DashboardModule,
    ActividadesModule,
    RepositorioModule,
    ConveniosModule,
    ConvenioComentariosModule,
    ConvenioArchivosModule,
    ConvenioHistorialModule,
    AnalisisDatosModule,
    EstrategiaComercialModule,
    ComunidadModule,
    NotificacionesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    PermisosService,
    AreasService,
    ContratoCheckService,
    ActividadVencimientoNotificacionService,
  ],
  exports: [PrismaService, PermisosService, AreasService],
})
export class AppModule {}
