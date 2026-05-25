export abstract class NotificacionRepository {
  abstract crear(data: any): Promise<any>;
  abstract listar(actualUserId: number, rol: string, queryUserId?: number): Promise<any[]>;
  abstract marcarLeido(id: number, leido: boolean, usuarioId?: number): Promise<any>;
  abstract actualizarPreferencia(id: number, usuarioId: number, data: { favorito?: boolean; archivado?: boolean }): Promise<any>;
  abstract eliminar(id: number, usuarioId?: number): Promise<any>;
}
