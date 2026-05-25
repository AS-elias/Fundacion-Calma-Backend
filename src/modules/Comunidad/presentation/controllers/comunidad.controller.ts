import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { PermisosGuard } from '../../../../core/guards/permisos.guard';
import { RequierePermiso } from '../../../../core/decorators/permiso.decorator';
import { Acciones } from '../../../../core/services/permisos.service';
import { RolesFundacion } from '../../../auth/domain/enums/roles.enum';
import { SearchContactosUseCase } from '../../application/use-cases/search-contactos.usecase';
import { AddContactoUseCase } from '../../application/use-cases/add-contacto.usecase';
import { GetContactosUseCase } from '../../application/use-cases/get-contactos.usecase';
import { GetContactosAccesiblesUseCase } from '../../application/use-cases/get-contactos-accesibles.usecase';
import { EnviarSolicitudContactoUseCase } from '../../application/use-cases/enviar-solicitud-contacto.usecase';
import { AceptarSolicitudUseCase } from '../../application/use-cases/aceptar-solicitud.usecase';
import { RechazarSolicitudUseCase } from '../../application/use-cases/rechazar-solicitud.usecase';
import { ListarSolicitudesRecibidasUseCase } from '../../application/use-cases/listar-solicitudes-recibidas.usecase';
import { ListarSolicitudesEnviadasUseCase } from '../../application/use-cases/listar-solicitudes-enviadas.usecase';
import { AddContactoDto } from '../../application/dto/add-contacto.dto';
import { EnviarSolicitudContactoDto } from '../../application/dto/enviar-solicitud-contacto.dto';
import { ActualizarSolicitudContactoDto } from '../../application/dto/actualizar-solicitud-contacto.dto';
import { AreasService } from '../../../../core/services/areas.service';
import { ComunicacionesService } from '../../../comunicaciones/application/services/comunicaciones.service';

@Controller('comunidad')
@UseGuards(JwtAuthGuard, PermisosGuard)
export class ComunidadController {
  constructor(
    private readonly searchContactosUseCase: SearchContactosUseCase,
    private readonly addContactoUseCase: AddContactoUseCase,
    private readonly getContactosUseCase: GetContactosUseCase,
    private readonly getContactosAccesiblesUseCase: GetContactosAccesiblesUseCase,
    private readonly enviarSolicitudContactoUseCase: EnviarSolicitudContactoUseCase,
    private readonly aceptarSolicitudUseCase: AceptarSolicitudUseCase,
    private readonly rechazarSolicitudUseCase: RechazarSolicitudUseCase,
    private readonly listarSolicitudesRecibidasUseCase: ListarSolicitudesRecibidasUseCase,
    private readonly listarSolicitudesEnviadasUseCase: ListarSolicitudesEnviadasUseCase,
    private readonly areasService: AreasService,
    private readonly comunicacionesService: ComunicacionesService,
  ) {}

  @Get('contactos')
  @RequierePermiso(Acciones.VER_CONTACTOS)
  async getContactos(@Query('tipo') tipo?: string, @Request() req?: any) {
    const usuarioId = req.user.id;

    // Si se pasa tipo=acceso_directo, devolver solo contactos accesibles sin solicitud
    if (tipo === 'acceso_directo') {
      return this.getContactosAccesiblesUseCase.execute(usuarioId);
    }

    return this.getContactosUseCase.execute(usuarioId);
  }

  @Get('contactos/buscar')
  @RequierePermiso(Acciones.VER_CONTACTOS)
  async searchContactos(
    @Query('q', new DefaultValuePipe('')) query: string,
    @Request() req: any,
  ) {
    const usuarioId = req.user.id;
    return this.searchContactosUseCase.execute(query, usuarioId);
  }

  @Post('contactos')
  @RequierePermiso(Acciones.AGREGAR_CONTACTO)
  async addContacto(@Body() dto: AddContactoDto, @Request() req: any) {
    const usuarioId = req.user.id;
    return this.addContactoUseCase.execute(dto.contactoId, usuarioId);
  }

  /**
   * POST /api/comunidad/solicitudes-contacto
   * Envía una solicitud para contactar a otro usuario
   */
  @Post('solicitudes-contacto')
  @RequierePermiso(Acciones.VER_CONTACTOS)
  async enviarSolicitudContacto(
    @Body() dto: EnviarSolicitudContactoDto,
    @Request() req: any,
  ) {
    const usuarioId = req.user.id;
    return this.enviarSolicitudContactoUseCase.execute(
      usuarioId,
      dto.contactoId,
    );
  }

  /**
   * GET /api/comunidad/solicitudes-contacto/recibidas
   * Lista las solicitudes de contacto recibidas
   */
  @Get('solicitudes-contacto/recibidas')
  @RequierePermiso(Acciones.VER_CONTACTOS)
  async listarSolicitudesRecibidas(
    @Query('estado') estado?: string,
    @Request() req?: any,
  ) {
    const usuarioId = req.user.id;
    return this.listarSolicitudesRecibidasUseCase.execute(usuarioId, estado);
  }

  /**
   * GET /api/comunidad/solicitudes-contacto/enviadas
   * Lista las solicitudes de contacto enviadas
   */
  @Get('solicitudes-contacto/enviadas')
  @RequierePermiso(Acciones.VER_CONTACTOS)
  async listarSolicitudesEnviadas(
    @Query('estado') estado?: string,
    @Request() req?: any,
  ) {
    const usuarioId = req.user.id;
    return this.listarSolicitudesEnviadasUseCase.execute(usuarioId, estado);
  }

  /**
   * PATCH /api/comunidad/solicitudes-contacto/:id/aceptar
   * Acepta una solicitud de contacto
   */
  @Patch('solicitudes-contacto/:id/aceptar')
  @RequierePermiso(Acciones.VER_CONTACTOS)
  async aceptarSolicitud(
    @Param('id', ParseIntPipe) solicitudId: number,
    @Request() req: any,
  ) {
    const usuarioId = req.user.id;
    return this.aceptarSolicitudUseCase.execute(solicitudId, usuarioId);
  }

  /**
   * PATCH /api/comunidad/solicitudes-contacto/:id/rechazar
   * Rechaza una solicitud de contacto
   */
  @Patch('solicitudes-contacto/:id/rechazar')
  @RequierePermiso(Acciones.VER_CONTACTOS)
  async rechazarSolicitud(
    @Param('id', ParseIntPipe) solicitudId: number,
    @Request() req: any,
  ) {
    const usuarioId = req.user.id;
    return this.rechazarSolicitudUseCase.execute(solicitudId, usuarioId);
  }

  @Get('areas')
  // Sin @RequierePermiso: cualquier usuario autenticado puede ver SUS áreas.
  // AreasService filtra según el rol (Admin→todo, Director→sus áreas+subareas, resto→solo asignadas)
  async getAreasPermitidas(
    @Request() req: any,
    @Query('todas') todas?: string,
  ) {
    const usuario = req.user; // { id, email, rol } — del JwtStrategy.validate()
    const esAdmin =
      usuario.rol === RolesFundacion.ADMIN ||
      usuario.rol === RolesFundacion.ADMINISTRADOR;
    const incluirTodas = todas === 'true' && esAdmin;
    const esDirector = usuario.rol === RolesFundacion.DIRECTOR;
    return this.areasService.obtenerAreasFiltradas(
      usuario.id,
      incluirTodas,
      esDirector,
    );
  }

  @Get('areas/:id/acceso')
  @RequierePermiso(Acciones.GESTIONAR_AREAS)
  async verificarAccesoArea(
    @Param('id', ParseIntPipe) areaId: number,
    @Request() req: any,
  ) {
    const usuarioId = req.user.id;
    const tieneAcceso = await this.areasService.puedeAccederAreaCompleta(
      usuarioId,
      areaId,
    );
    return { tieneAcceso };
  }

  @Get('usuarios/:id/areas')
  @RequierePermiso(Acciones.GESTIONAR_AREAS)
  async getPermisosUsuarioAreas(@Param('id', ParseIntPipe) id: number) {
    return this.areasService.obtenerPermisosAreaUsuario(id);
  }

  @Post('usuarios/:id/areas')
  @RequierePermiso(Acciones.GESTIONAR_AREAS)
  async setPermisosUsuarioAreas(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    permisos: Array<{
      area_id: number;
      puede_publicar?: boolean;
      puede_editar?: boolean;
      permitir_subareas?: boolean;
    }>,
  ) {
    return this.areasService.actualizarPermisosAreaUsuario(id, permisos);
  }

  // Crear chat directo con un contacto
  @Post('contactos/:contactoId/chat')
  @RequierePermiso(Acciones.VER_CONTACTOS)
  async createDirectChat(
    @Param('contactoId', ParseIntPipe) contactoId: number,
    @Request() req: any,
  ) {
    const usuarioId = req.user.id;

    // Verificar que el contacto existe y está activo
    const contacto = await this.searchContactosUseCase.execute('', usuarioId);
    const contactoValido = contacto.find((c) => c.id === contactoId);
    if (!contactoValido) {
      throw new BadRequestException('Contacto no encontrado o no válido');
    }

    // Crear el chat directo
    const canal = await this.comunicacionesService.createChannel({
      nombre: `${req.user.nombre} - ${contactoValido.nombreCompleto}`,
      descripcion: 'Chat directo',
      creadorId: usuarioId,
      participanteIds: [usuarioId, contactoId],
      esGrupo: false,
    });

    return {
      success: true,
      canal: {
        id: canal.id,
        nombre: canal.nombre,
        descripcion: canal.descripcion,
        esGrupo: canal.es_grupo,
        participantes:
          canal.participantes_canal?.map((pc) => ({
            usuarioId: pc.usuario_id,
            nombre: pc.usuarios?.nombre_completo,
          })) ?? [],
      },
    };
  }
}
