import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import type { IComunidadRepository } from '../../domain/repositories/comunidad.repository';
import { COMUNIDAD_REPOSITORY } from '../../domain/repositories/comunidad.repository';

@Injectable()
export class RechazarSolicitudUseCase {
  constructor(
    @Inject(COMUNIDAD_REPOSITORY)
    private readonly comunidadRepository: IComunidadRepository,
  ) {}

  async execute(solicitudId: number, usuarioId: number): Promise<any> {
    // Obtener la solicitud
    const solicitud =
      await this.comunidadRepository.obtenerSolicitudPorId(solicitudId);

    if (!solicitud) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    // Verificar que el usuario sea el receptor de la solicitud
    if (solicitud.contacto_id !== usuarioId) {
      throw new BadRequestException(
        'Solo el receptor puede rechazar la solicitud',
      );
    }

    // Verificar que la solicitud esté pendiente
    if (solicitud.estado !== 'pendiente') {
      throw new BadRequestException(
        `No se puede rechazar una solicitud en estado: ${solicitud.estado}`,
      );
    }

    // Actualizar estado
    return this.comunidadRepository.actualizarSolicitudContacto(
      solicitudId,
      'rechazado',
    );
  }
}
