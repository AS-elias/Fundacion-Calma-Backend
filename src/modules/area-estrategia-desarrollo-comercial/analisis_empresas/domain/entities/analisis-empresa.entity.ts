export class AnalisisEmpresa {
  id!: number;
  ruc?: string | null;
  nombre!: string;
  correo?: string | null;
  telefono_fijo?: string | null;
  celular?: string | null;
  departamento?: string | null;
  distrito?: string | null;
  direccion?: string | null;
  sector?: string | null;
  estado?: string | null;
  descripcion?: string | null;
  created_at?: Date | null;
  updated_at?: Date | null;

  constructor(data: AnalisisEmpresa) {
    Object.assign(this, data);
  }
}
