export class CreateEstrategiaProyectoDto {
  empresa_id?: number | string;
  empresaId?: number | string;
  titulo?: string;
  descripcion?: string;
  estado?: string;
  fecha_limite?: string | Date;
  fechaLimite?: string | Date;
  enlaces?: { etiqueta?: string; url?: string }[];
}
