export class CreateEstrategiaActividadDto {
  titulo?: string;
  descripcion?: string;
  estado?: string;
  creado_por?: string;
  creadoPor?: string;
  prioridad?: string;
  fecha_creacion?: string | Date;
  fechaCreacion?: string | Date;
  fecha_limite?: string | Date;
  fechaLimite?: string | Date;
  enlaces?: { nombre?: string; url?: string }[];
}
