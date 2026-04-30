export class AnalisisVenue {
  id!: number;
  nombre!: string;
  departamento?: string | null;
  distrito?: string | null;
  direccion?: string | null;
  celular?: string | null;
  correo?: string | null;
  capacidad_personas?: number | null;
  estado?: string | null;
  sitio_web?: string | null;
  detalles?: string | null;
  created_at?: Date | null;
  updated_at?: Date | null;

  constructor(data: AnalisisVenue) {
    Object.assign(this, data);
  }
}
