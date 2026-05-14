/** Entidad de Dominio que representa una Sala de Trabajo */
export class SalaEntity {
  id: number;
  nombre: string;
  area: string;
  link: string;
  descripcion?: string | null;
  es_general: boolean;
  creador_id?: number | null;
  created_at?: Date | null;
  updated_at?: Date | null;
}