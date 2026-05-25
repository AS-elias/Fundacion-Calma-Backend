export class DashboardActivityDto {
  usuario: string;
  detalle: string;
  entidad: string;
  tipo: string;
  fecha: Date;
}

export class DashboardTareaStatsDto {
  pendientes: number;
  progreso: number;
  ejecucion: number;
  completadas: number;
  paralizado: number;
}

export class DashboardComunicacionesStatsDto {
  pendiente: number;
  proceso: number;
  firmados: number;
  cancelados: number;
}

export class DirectorEvaluationDto {
  id: number;
  director_id: number | null;
  usuario_id?: number | null;
  usuario_nombre?: string | null;
  rating: number;
  comentario: string | null;
  created_at: Date;
}

export class PendingUserDto {
  id: number;
  nombre: string;
  email: string;
  rol: string | null;
}

export class DashboardBaseDto {
  totalProyectos: number;
  proyectosRegistrados: number;
  conveniosVigentes: number | null;
  actividadReciente: DashboardActivityDto[];
  estadisticasTareas: DashboardTareaStatsDto;
  estadisticasComunicaciones: DashboardComunicacionesStatsDto | null;
}

export class DashboardAdminDto extends DashboardBaseDto {}

export class DashboardUserDto extends DashboardBaseDto {
  misProyectos: number;
  misConvenios: number | null;
  desempenoEquipo: number;
  desempenoPersonal?: number | null;
  directorEvaluations: DirectorEvaluationDto[];
  promedioEvaluacionDirector: number;
  pendientesEvaluacion: PendingUserDto[];
}
