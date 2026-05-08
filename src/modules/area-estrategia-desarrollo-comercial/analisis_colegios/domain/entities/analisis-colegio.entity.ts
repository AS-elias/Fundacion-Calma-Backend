export class AnalisisColegio {
  id!: number;
  codigo_modular?: string | null;
  nombre!: string;
  correo?: string | null;
  telefono?: string | null;
  nivel?: string | null;
  director?: string | null;
  tipo?: string | null;
  ugel?: string | null;
  departamento?: string | null;
  distrito?: string | null;
  zona?: string | null;
  cantidad_alumnos?: number | null;
  direccion?: string | null;
  created_at?: Date | null;
  updated_at?: Date | null;

  constructor(data: AnalisisColegio) {
    Object.assign(this, data);
  }
}
