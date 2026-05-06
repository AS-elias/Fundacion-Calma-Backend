import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { RolesFundacion } from '../../domain/enums/roles.enum';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const adminRoles = [RolesFundacion.ADMIN, RolesFundacion.ADMINISTRADOR];

    if (!user || !adminRoles.includes(user.rol)) {
      throw new ForbiddenException(
        'Solo los administradores pueden registrar nuevos usuarios',
      );
    }

    return true;
  }
}
