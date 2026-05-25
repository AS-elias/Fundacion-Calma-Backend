import { Injectable } from '@nestjs/common';
import { formatDateOnly } from '../../../../core/utils/date-only.util';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { IComunidadRepository } from '../../domain/repositories/comunidad.repository';
import { ContactoEntity } from '../../domain/entities/contacto.entity';
import { PresenceService } from '../../../../core/services/presence.service';

@Injectable()
export class PrismaComunidadRepository implements IComunidadRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly presenceService: PresenceService,
  ) {}

  async obtenerContactos(usuarioId: number): Promise<ContactoEntity[]> {
    // Obtener contactos del usuario (usuarios que ha agregado)
    // Asumiendo que hay una tabla de contactos o similar. Por ahora, devolver usuarios activos.
    // TODO: Implementar tabla de contactos personales
    return this.obtenerContactosActivos(usuarioId);
  }

  async buscarUsuariosActivos(
    query: string,
    usuarioId: number,
  ): Promise<ContactoEntity[]> {
    const whereCondition: any = {
      estado: 'ACTIVO',
      id: { not: usuarioId },
    };

    if (query && query.trim()) {
      whereCondition.AND = [
        {
          OR: [
            {
              nombre_completo: { contains: query.trim(), mode: 'insensitive' },
            },
            {
              apellido_completo: {
                contains: query.trim(),
                mode: 'insensitive',
              },
            },
            { email: { contains: query.trim(), mode: 'insensitive' } },
          ],
        },
      ];
    }

    const usuariosDb = await this.prisma.usuarios.findMany({
      where: whereCondition,
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
        this.presenceService.isUserOnline(user.id),
        user.biografia,
        user.linkedin_url,
        user.fecha_nacimiento
          ? formatDateOnly(user.fecha_nacimiento)
          : null,
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

  async obtenerContactosActivos(usuarioId?: number): Promise<ContactoEntity[]> {
    // 1. Buscamos en la base de datos usando Prisma
    const usuariosDb = await this.prisma.usuarios.findMany({
      where: {
        estado: 'ACTIVO',
        ...(usuarioId ? { id: { not: usuarioId } } : {}), // Excluir al usuario actual si se proporciona
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
        this.presenceService.isUserOnline(user.id),
        user.biografia,
        user.linkedin_url,
        user.fecha_nacimiento
          ? formatDateOnly(user.fecha_nacimiento)
          : null,
      );
    });
  }

  async obtenerContactosAccesibles(
    usuarioId: number,
  ): Promise<ContactoEntity[]> {
    // Contactos sin solicitud (mismo área) + contactos con solicitud aceptada
    const usuariosDb = await this.prisma.usuarios.findMany({
      where: {
        estado: 'ACTIVO',
        id: { not: usuarioId },
        OR: [
          // Misma área (permiso_area.area_id)
          {
            permisos_area: {
              some: {
                area_id: {
                  in: await this.prisma.permisos_area
                    .findMany({
                      where: { usuario_id: usuarioId },
                      select: { area_id: true },
                    })
                    .then((permisos) => permisos.map((p) => p.area_id!)),
                },
              },
            },
          },
          // Con solicitud aceptada
          {
            solicitudes_recibidas: {
              some: {
                usuario_id: usuarioId,
                estado: 'aceptado',
              },
            },
          },
        ],
      },
      include: {
        roles: true,
        permisos_area: {
          include: { areas: true },
          take: 1,
        },
      },
    });

    return this._mapearContactos(usuariosDb);
  }

  async verificarContactoExiste(contactoId: number): Promise<boolean> {
    const usuario = await this.prisma.usuarios.findUnique({
      where: { id: contactoId },
      select: { id: true, estado: true },
    });
    return usuario?.estado === 'ACTIVO' || false;
  }

  async crearSolicitudContacto(
    usuarioId: number,
    contactoId: number,
  ): Promise<any> {
    return this.prisma.solicitudes_contacto.create({
      data: {
        usuario_id: usuarioId,
        contacto_id: contactoId,
        estado: 'pendiente',
      },
      include: {
        usuario_solicitante: {
          select: {
            id: true,
            nombre_completo: true,
            apellido_completo: true,
            email: true,
            foto_url: true,
          },
        },
        usuario_contacto: {
          select: {
            id: true,
            nombre_completo: true,
            apellido_completo: true,
            email: true,
            foto_url: true,
          },
        },
      },
    });
  }

  async obtenerSolicitudExistente(
    usuarioId: number,
    contactoId: number,
  ): Promise<any> {
    return this.prisma.solicitudes_contacto.findFirst({
      where: {
        usuario_id: usuarioId,
        contacto_id: contactoId,
      },
    });
  }

  async obtenerSolicitudPorId(solicitudId: number): Promise<any> {
    return this.prisma.solicitudes_contacto.findUnique({
      where: { id: solicitudId },
      include: {
        usuario_solicitante: {
          select: {
            id: true,
            nombre_completo: true,
            apellido_completo: true,
            email: true,
            foto_url: true,
          },
        },
        usuario_contacto: {
          select: {
            id: true,
            nombre_completo: true,
            apellido_completo: true,
            email: true,
            foto_url: true,
          },
        },
      },
    });
  }

  async actualizarSolicitudContacto(
    solicitudId: number,
    estado: string,
  ): Promise<any> {
    return this.prisma.solicitudes_contacto.update({
      where: { id: solicitudId },
      data: { estado, fecha_actualizado: new Date() },
      include: {
        usuario_solicitante: {
          select: {
            id: true,
            nombre_completo: true,
            apellido_completo: true,
            email: true,
            foto_url: true,
          },
        },
        usuario_contacto: {
          select: {
            id: true,
            nombre_completo: true,
            apellido_completo: true,
            email: true,
            foto_url: true,
          },
        },
      },
    });
  }

  async obtenerSolicitudesRecibidas(
    usuarioId: number,
    estado?: string,
  ): Promise<any[]> {
    return this.prisma.solicitudes_contacto.findMany({
      where: {
        contacto_id: usuarioId,
        ...(estado ? { estado } : {}),
      },
      include: {
        usuario_solicitante: {
          select: {
            id: true,
            nombre_completo: true,
            apellido_completo: true,
            email: true,
            foto_url: true,
            puesto: true,
          },
        },
      },
      orderBy: { fecha_creacion: 'desc' },
    });
  }

  async obtenerSolicitudesEnviadas(
    usuarioId: number,
    estado?: string,
  ): Promise<any[]> {
    return this.prisma.solicitudes_contacto.findMany({
      where: {
        usuario_id: usuarioId,
        ...(estado ? { estado } : {}),
      },
      include: {
        usuario_contacto: {
          select: {
            id: true,
            nombre_completo: true,
            apellido_completo: true,
            email: true,
            foto_url: true,
            puesto: true,
          },
        },
      },
      orderBy: { fecha_creacion: 'desc' },
    });
  }

  private _mapearContactos(usuariosDb: any[]): ContactoEntity[] {
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
        this.presenceService.isUserOnline(user.id),
        user.biografia,
        user.linkedin_url,
        user.fecha_nacimiento
          ? formatDateOnly(user.fecha_nacimiento)
          : null,
      );
    });
  }
}
