import { EstrategiaActividadEstadoEnum } from '../enums/estrategia-actividad-estado.enum';
import { EstrategiaPrioridadEnum } from '../enums/estrategia-prioridad.enum';

export class EstrategiaActividad {
  id!: number;
  titulo!: string;
  descripcion?: string | null;
  estado!: EstrategiaActividadEstadoEnum;
  creado_por?: string | null;
  prioridad!: EstrategiaPrioridadEnum;
  fecha_creacion?: Date | null;
  fecha_limite?: Date | null;
  created_at?: Date | null;
  updated_at?: Date | null;

  constructor(data: EstrategiaActividad) {
    Object.assign(this, data);
  }
}
