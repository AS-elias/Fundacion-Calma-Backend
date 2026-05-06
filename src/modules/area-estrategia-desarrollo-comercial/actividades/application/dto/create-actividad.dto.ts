import { EstadoActividad } from '../../domain/enums/estado-actividad.enum';
import { ActividadEnlaceDto } from './actividad-enlace.dto';

export class CreateActividadDto {
  areaId?: number;
  titulo!: string;
  descripcion?: string;
  estado?: EstadoActividad | string;
  fechaLimite?: Date | string;
  creadorId?: number;
  enlaces?: ActividadEnlaceDto[];
}
