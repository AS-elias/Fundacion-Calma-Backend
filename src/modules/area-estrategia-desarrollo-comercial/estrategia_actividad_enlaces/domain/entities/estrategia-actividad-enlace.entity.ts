export class EstrategiaActividadEnlace {
  id!: number;
  actividad_id!: number;
  nombre!: string;
  url!: string;
  created_at?: Date | null;
  updated_at?: Date | null;

  constructor(data: EstrategiaActividadEnlace) {
    Object.assign(this, data);
  }
}
