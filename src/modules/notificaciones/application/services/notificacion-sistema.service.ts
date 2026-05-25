import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { NotificacionPrismaRepository } from '../../infrastructure/repositories/prisma-notificacion.repository';

type NotificacionSistemaOptions = {
  apartado?: string;
  accion?: string;
  usuarioId?: number | null;
  usuarioNombre?: string | null;
  automatico?: boolean;
  ruta?: string | null;
};

@Injectable()
export class NotificacionSistemaService {
  constructor(
    private readonly repo: NotificacionPrismaRepository,
    private readonly prisma: PrismaService,
  ) {}

  async registrar(
    titulo: string,
    mensaje: string,
    options: NotificacionSistemaOptions = {},
  ): Promise<void> {
    const detalle = await this.construirDetalle(mensaje, options);

    await this.repo.crear({
      titulo,
      mensaje: detalle,
      tipo: 'sistema',
      imagen: null,
    });
  }

  private async construirDetalle(
    mensaje: string,
    options: NotificacionSistemaOptions,
  ): Promise<string> {
    const usuario = await this.obtenerUsuario(options);
    const mensajePrincipal =
      usuario && !options.automatico
        ? `${mensaje.trim()}\nResponsable: ${usuario}.`
        : mensaje.trim();
    const partes = [mensajePrincipal];

    if (options.apartado) {
      partes.push(`Apartado: ${options.apartado}`);
    }

    if (options.accion) {
      partes.push(`Accion: ${options.accion}`);
    }

    const ruta = options.ruta ?? this.inferirRuta(options.apartado);

    if (ruta) {
      partes.push(`Ruta: ${ruta}`);
    }

    if (usuario && !options.automatico) {
      partes.push(`Usuario: ${usuario}`);
    }

    if (options.automatico) {
      partes.push('Origen: Sistema automatico');
    }

    return partes.filter(Boolean).join('\n');
  }

  private inferirRuta(apartado?: string): string | null {
    const valor = apartado?.toLowerCase().trim() ?? '';

    if (!valor) {
      return null;
    }

    if (valor.includes('convenio') || valor.includes('desarrollo')) {
      return '/dashboard/director-dashboard/desarrollo-comercial';
    }

    if (valor.includes('estrategia')) {
      return '/dashboard/director-dashboard/estrategia-comercial';
    }

    if (valor.includes('analisis') || valor.includes('análisis')) {
      return '/dashboard/director-dashboard/analisis-datos';
    }

    if (valor.includes('repositorio')) {
      return '/repositorio';
    }

    if (valor.includes('usuario')) {
      return '/dashboard/admin-dashboard/usuarios';
    }

    return null;
  }

  private async obtenerUsuario(
    options: NotificacionSistemaOptions,
  ): Promise<string | null> {
    if (options.usuarioNombre?.trim()) {
      return options.usuarioNombre.trim();
    }

    if (!options.usuarioId) {
      return null;
    }

    const usuario = await this.prisma.usuarios.findUnique({
      where: { id: options.usuarioId },
      select: {
        nombre_completo: true,
        apellido_completo: true,
        email: true,
      },
    });

    if (!usuario) {
      return null;
    }

    return `${usuario.nombre_completo ?? ''} ${usuario.apellido_completo ?? ''}`.trim()
      || usuario.email
      || null;
  }
}
