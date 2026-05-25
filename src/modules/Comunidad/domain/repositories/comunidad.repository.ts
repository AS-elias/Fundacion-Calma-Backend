import { ContactoEntity } from '../entities/contacto.entity';

// Creamos un Token para que NestJS sepa cómo inyectar esta interfaz más adelante
export const COMUNIDAD_REPOSITORY = 'COMUNIDAD_REPOSITORY';

export interface IComunidadRepository {
  /**
   * Obtiene los contactos del usuario.
   */
  obtenerContactos(usuarioId: number): Promise<ContactoEntity[]>;

  /**
   * Busca usuarios activos por nombre o email.
   */
  buscarUsuariosActivos(
    query: string,
    usuarioId: number,
  ): Promise<ContactoEntity[]>;

  /**
   * Agrega un contacto existente al usuario.
   */
  agregarContacto(contactoId: number, usuarioId: number): Promise<void>;

  /**
   * Obtiene contactos accesibles (sin solicitud + con solicitud aceptada + misma área)
   */
  obtenerContactosAccesibles(usuarioId: number): Promise<ContactoEntity[]>;

  /**
   * Verifica si un contacto existe y está activo.
   */
  verificarContactoExiste(contactoId: number): Promise<boolean>;

  /**
   * Crea una solicitud de contacto.
   */
  crearSolicitudContacto(usuarioId: number, contactoId: number): Promise<any>;

  /**
   * Obtiene una solicitud existente entre dos usuarios.
   */
  obtenerSolicitudExistente(
    usuarioId: number,
    contactoId: number,
  ): Promise<any>;

  /**
   * Obtiene una solicitud por ID.
   */
  obtenerSolicitudPorId(solicitudId: number): Promise<any>;

  /**
   * Actualiza el estado de una solicitud.
   */
  actualizarSolicitudContacto(
    solicitudId: number,
    estado: string,
  ): Promise<any>;

  /**
   * Obtiene solicitudes recibidas por el usuario.
   */
  obtenerSolicitudesRecibidas(
    usuarioId: number,
    estado?: string,
  ): Promise<any[]>;

  /**
   * Obtiene solicitudes enviadas por el usuario.
   */
  obtenerSolicitudesEnviadas(
    usuarioId: number,
    estado?: string,
  ): Promise<any[]>;
}
