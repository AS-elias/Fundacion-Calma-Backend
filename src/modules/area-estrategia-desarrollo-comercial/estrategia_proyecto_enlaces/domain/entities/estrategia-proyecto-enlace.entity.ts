export class EstrategiaProyectoEnlace {
  id!: number;
  proyecto_id?: number | null;
  etiqueta!: string;
  url!: string;
  created_at?: Date | null;
  updated_at?: Date | null;

  constructor(data: EstrategiaProyectoEnlace) {
    Object.assign(this, data);
  }
}
