export class EstrategiaEmpresa {
  id!: number;
  nombre!: string;
  descripcion?: string | null;
  created_at?: Date | null;
  updated_at?: Date | null;

  constructor(data: EstrategiaEmpresa) {
    Object.assign(this, data);
  }
}
