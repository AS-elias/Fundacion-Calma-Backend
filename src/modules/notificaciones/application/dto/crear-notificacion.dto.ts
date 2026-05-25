export type TipoNotificacion = 'sistema' | 'comunicados';

export class CrearNotificacionDto {
  titulo: string;
  mensaje: string;
  tipo: TipoNotificacion;
  imagen?: string;
}
