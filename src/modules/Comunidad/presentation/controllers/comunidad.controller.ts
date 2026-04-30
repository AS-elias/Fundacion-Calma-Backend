import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
  ParseIntPipe, // 🔥 1. IMPORTAMOS ParseIntPipe AQUÍ
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { PermisosGuard } from '../../../../core/guards/permisos.guard';
import { RequierePermiso } from '../../../../core/decorators/permiso.decorator';
import { Acciones } from '../../../../core/services/permisos.service';
import { RolesFundacion } from '../../../auth/domain/enums/roles.enum';
import { SearchContactosUseCase } from '../../application/use-cases/search-contactos.usecase';
import { AddContactoUseCase } from '../../application/use-cases/add-contacto.usecase';
import { GetContactosUseCase } from '../../application/use-cases/get-contactos.usecase';
import { AddContactoDto } from '../../application/dto/add-contacto.dto';
import { AreasService } from '../../../../core/services/areas.service';

@Controller('comunidad')
@UseGuards(JwtAuthGuard, PermisosGuard)
export class ComunidadController {
  constructor(
    private readonly searchContactosUseCase: SearchContactosUseCase,
    private readonly addContactoUseCase: AddContactoUseCase,
    private readonly getContactosUseCase: GetContactosUseCase,
    private readonly areasService: AreasService,
  ) {}

  @Get('contactos')
  @RequierePermiso(Acciones.VER_CONTACTOS)
  async getContactos(@Request() req: any) {
    const usuarioId = req.user.id;
    return this.getContactosUseCase.execute(usuarioId);
  }

  @Get('contactos/buscar')
  @RequierePermiso(Acciones.VER_CONTACTOS)
  async searchContactos(@Query('q') query: string, @Request() req: any) {
    const usuarioId = req.user.id;
    return this.searchContactosUseCase.execute(query, usuarioId);
  }

  @Post('contactos')
  @RequierePermiso(Acciones.AGREGAR_CONTACTO)
  async addContacto(@Body() dto: AddContactoDto, @Request() req: any) {
    const usuarioId = req.user.id;
    return this.addContactoUseCase.execute(dto.contactoId, usuarioId);
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
    @Param('id', ParseIntPipe) areaId: number, // 🔥 2. AGREGADO AQUÍ
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
    // 🔥 3. AGREGADO AQUÍ
    return this.areasService.obtenerPermisosAreaUsuario(id);
  }

  @Post('usuarios/:id/areas')
  @RequierePermiso(Acciones.GESTIONAR_AREAS)
  async setPermisosUsuarioAreas(
    @Param('id', ParseIntPipe) id: number, // 🔥 4. AGREGADO AQUÍ
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
}
