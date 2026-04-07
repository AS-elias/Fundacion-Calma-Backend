import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';

@Injectable()
export class AreaGuard implements CanActivate {
  // Inyectamos Prisma porque necesitamos consultar la base de datos en tiempo real
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // Esto viene de tu JwtStrategy

    // Asumimos que el ID del área viene en la ruta (ej: /api/areas/14/convenios)
    // o en el cuerpo de la petición (POST)
    const areaId =
      request.params.areaId || request.body.area_id || request.query.area_id;

    if (!areaId) {
      throw new ForbiddenException(
        'Se requiere especificar el ID del área para esta acción',
      );
    }

    // Buscamos si el usuario tiene un registro en permisos_area para esa área
    const permiso = await this.prisma.permisos_area.findFirst({
      where: {
        usuario_id: user.id,
        area_id: Number(areaId),
      },
    });

    // 1. Validar si tiene acceso al área
    if (!permiso) {
      throw new ForbiddenException(
        'No tienes acceso a esta área de la fundación',
      );
    }

    // 2. Magia extra: Validar permisos de escritura según el método HTTP
    // Si la petición NO es un GET (es decir, es POST, PUT, DELETE) y no tiene puede_editar en true
    if (request.method !== 'GET' && !permiso.puede_editar) {
      throw new ForbiddenException(
        'Solo tienes permisos de lectura, no puedes modificar datos en esta área',
      );
    }

    return true; // ¡Acceso concedido!
  }
}
