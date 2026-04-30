import { EstrategiaProyectoEstadoEnum } from '../enums/estrategia-proyecto-estado.enum';

export class EstrategiaProyecto {
  id!: number;
  empresa_id?: number | null;
  titulo!: string;
  descripcion?: string | null;
  estado!: EstrategiaProyectoEstadoEnum;
  fecha_limite?: Date | null;
  created_at?: Date | null;
  updated_at?: Date | null;

  constructor(data: EstrategiaProyecto) {
    Object.assign(this, data);
  }
}
