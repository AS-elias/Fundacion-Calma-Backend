import { EstadoActividad } from '../../domain/enums/estado-actividad.enum';
import { ActividadEnlaceDto } from './actividad-enlace.dto';

export class UpdateActividadDto {
  areaId?: number;
  titulo?: string;
  descripcion?: string | null;
  estado?: EstadoActividad | string;
  fechaLimite?: Date | string | null;
  creadorId?: number | null;
  enlaces?: ActividadEnlaceDto[];
}
