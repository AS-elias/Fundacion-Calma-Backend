import { SetMetadata } from '@nestjs/common';
import { Acciones } from '../services/permisos.service';
import {
  PERMISO_KEY,
  AREA_KEY,
  PermisoMetadata,
} from '../guards/permisos.guard';

export const RequierePermiso = (accion: Acciones, areaId?: number) => {
  return SetMetadata(PERMISO_KEY, { accion, areaId } as PermisoMetadata);
};
