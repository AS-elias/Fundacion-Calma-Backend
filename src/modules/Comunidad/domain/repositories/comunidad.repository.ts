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
}
