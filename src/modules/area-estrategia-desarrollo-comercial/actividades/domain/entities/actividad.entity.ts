import { EstadoActividad } from '../enums/estado-actividad.enum';
import { ActividadEnlace } from './actividad-enlace.entity';

export class Actividad {
  constructor(
    public id: number,
    public areaId: number,
    public titulo: string,
    public descripcion: string | null,
    public estado: EstadoActividad,
    public fechaLimite: Date | null,
    public creadorId: number | null,
    public fechaCreacion: Date,
    public enlaces: ActividadEnlace[],
  ) {}
}
