import { CreateAnalisisTareaEnlaceDto } from '../../../analisis_tarea_enlaces/application/dto/create-analisis-tarea-enlace.dto';

export class CreateAnalisisTareaDto {
  area_id?: number | string;
  areaId?: number | string;
  titulo?: string;
  subtitulo?: string;
  descripcion?: string;
  estado?: string;
  fecha_limite?: Date | string;
  fechaLimite?: Date | string;
  creador_id?: number | string;
  creadorId?: number | string;
  enlaces?: CreateAnalisisTareaEnlaceDto[];
}
