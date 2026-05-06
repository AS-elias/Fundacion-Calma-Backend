import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermisosService, Acciones } from '../services/permisos.service';
// 👇 IMPORTAMOS EL ENUM DE ROLES (ajusta la ruta si es necesario)
import { RolesFundacion } from '../../modules/auth/domain/enums/roles.enum';

export const PERMISO_KEY = 'permiso';
export const AREA_KEY = 'areaId';

export interface PermisoMetadata {
  accion: Acciones;
  areaId?: number;
}

@Injectable()
export class PermisosGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permisosService: PermisosService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permiso = this.reflector.get<PermisoMetadata>(
      PERMISO_KEY,
      context.getHandler(),
    );
    if (!permiso) {
      return true; // Si no hay metadata de permiso, permitir acceso
    }

    const request = context.switchToHttp().getRequest();
    // JwtStrategy.validate() retorna { id, email, rol }
    const usuario = request.user;

    if (!usuario || !usuario.id) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    // 🔥 LA REGLA DE ORO: EL ADMINISTRADOR TIENE PASE LIBRE 🔥
    // Si el usuario es Administrador, lo dejamos pasar sin verificar en la base de datos
    if (
      usuario.rol === RolesFundacion.ADMIN ||
      usuario.rol === RolesFundacion.ADMINISTRADOR
    ) {
      return true;
    }

    // Obtener areaId de metadata o de request
    let areaId = permiso.areaId;
    if (!areaId) {
      // Intentar obtener de params, body, o query
      areaId =
        request.params?.areaId || request.body?.areaId || request.query?.areaId;
    }

    // Si NO es administrador, entonces sí verificamos sus permisos específicos
    const tienePermiso = await this.permisosService.tienePermiso(
      usuario.id,
      permiso.accion,
      areaId,
    );

    if (!tienePermiso) {
      throw new ForbiddenException(
        'No tienes permisos para realizar esta acción',
      );
    }

    return true;
  }
}
