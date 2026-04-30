import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { IComunidadRepository } from '../../domain/repositories/comunidad.repository';
import { ContactoEntity } from '../../domain/entities/contacto.entity';

@Injectable()
export class PrismaComunidadRepository implements IComunidadRepository {
  constructor(private readonly prisma: PrismaService) {}

  async obtenerContactos(usuarioId: number): Promise<ContactoEntity[]> {
    // Obtener contactos del usuario (usuarios que ha agregado)
    // Asumiendo que hay una tabla de contactos o similar. Por ahora, devolver usuarios activos.
    // TODO: Implementar tabla de contactos personales
    return this.obtenerContactosActivos();
  }

  async buscarUsuariosActivos(
    query: string,
    usuarioId: number,
  ): Promise<ContactoEntity[]> {
    const usuariosDb = await this.prisma.usuarios.findMany({
      where: {
        estado: 'ACTIVO',
        AND: [
          {
            OR: [
              { nombre_completo: { contains: query, mode: 'insensitive' } },
              { apellido_completo: { contains: query, mode: 'insensitive' } },
              { email: { contains: query, mode: 'insensitive' } },
            ],
          },
          { id: { not: usuarioId } }, // Excluir al propio usuario
        ],
      },
      include: {
        roles: true,
        permisos_area: {
          include: {
            areas: true,
          },
          take: 1,
        },
      },
    });

    return usuariosDb.map((user) => {
      const iniciales =
        `${user.nombre_completo?.charAt(0) || ''}${user.apellido_completo?.charAt(0) || ''}`.toUpperCase();
      const areaNombre =
        user.permisos_area.length > 0 && user.permisos_area[0].areas
          ? user.permisos_area[0].areas.nombre
          : 'General';
      const rolNombre =
        user.puesto || (user.roles ? user.roles.nombre : 'Miembro');

      return new ContactoEntity(
        user.id,
        user.nombre_completo,
        user.apellido_completo,
        user.email,
        user.telefono,
        user.puesto,
        user.foto_url,
        user.estado,
        rolNombre,
        areaNombre,
        iniciales,
      );
    });
  }

  async agregarContacto(contactoId: number, usuarioId: number): Promise<void> {
    // Verificar que el contacto existe y está activo
    const contacto = await this.prisma.usuarios.findUnique({
      where: { id: contactoId },
    });

    if (!contacto || contacto.estado !== 'ACTIVO') {
      throw new Error('Usuario no encontrado o no activo');
    }

    // TODO: Implementar tabla de contactos personales
    // Por ahora, solo verificar que existe
    // En el futuro: insertar en tabla contactos (usuario_id, contacto_id)
  }

  async obtenerContactosActivos(): Promise<ContactoEntity[]> {
    // 1. Buscamos en la base de datos usando Prisma
    const usuariosDb = await this.prisma.usuarios.findMany({
      where: {
        estado: 'ACTIVO',
      },
      include: {
        roles: true,
        permisos_area: {
          include: {
            areas: true,
          },
          take: 1, // Tomamos solo la primera área para la tarjeta principal
        },
      },
    });

    // 2. Mapeamos la respuesta de la Base de Datos a nuestra Entidad de Negocio
    return usuariosDb.map((user) => {
      // Calculamos las iniciales (Ej: Juan Perez -> JP)
      const iniciales =
        `${user.nombre_completo?.charAt(0) || ''}${user.apellido_completo?.charAt(0) || ''}`.toUpperCase();

      // Obtenemos el nombre del área
      const areaNombre =
        user.permisos_area.length > 0 && user.permisos_area[0].areas
          ? user.permisos_area[0].areas.nombre
          : 'General';

      const rolNombre =
        user.puesto || (user.roles ? user.roles.nombre : 'Miembro');

      return new ContactoEntity(
        user.id,
        user.nombre_completo,
        user.apellido_completo,
        user.email,
        user.telefono,
        user.puesto,
        user.foto_url,
        user.estado,
        rolNombre,
        areaNombre,
        iniciales,
      );
    });
  }
}
