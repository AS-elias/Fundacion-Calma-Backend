export class AnalisisTareaEnlace {
  id!: number;
  tarea_id?: number | null;
  nombre!: string;
  url!: string;
  created_at?: Date | null;
  updated_at?: Date | null;

  constructor(data: AnalisisTareaEnlace) {
    Object.assign(this, data);
  }
}
