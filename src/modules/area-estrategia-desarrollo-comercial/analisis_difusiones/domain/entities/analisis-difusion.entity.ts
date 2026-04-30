export class AnalisisDifusion {
  id!: number;
  nombre!: string;
  tipo?: string | null;
  plataforma?: string | null;
  lugar?: string | null;
  contacto?: string | null;
  celular?: string | null;
  correo?: string | null;
  fecha?: Date | null;
  estado?: string | null;
  observaciones?: string | null;
  created_at?: Date | null;
  updated_at?: Date | null;

  constructor(data: AnalisisDifusion) {
    Object.assign(this, data);
  }
}
