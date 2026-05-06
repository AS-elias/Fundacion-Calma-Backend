import { AnalisisTareaEnlace } from '../../../analisis_tarea_enlaces/domain/entities/analisis-tarea-enlace.entity';

export class AnalisisTarea {
  id!: number;
  area_id?: number | null;
  titulo!: string;
  subtitulo?: string | null;
  descripcion?: string | null;
  estado?: string | null;
  fecha_creacion?: Date | null;
  fecha_limite?: Date | null;
  created_at?: Date | null;
  updated_at?: Date | null;
  creador_id?: number | null;
  analisis_tarea_enlaces?: AnalisisTareaEnlace[];

  constructor(data: AnalisisTarea) {
    Object.assign(this, data);
  }
}
