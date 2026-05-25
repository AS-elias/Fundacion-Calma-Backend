import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import type { IComunidadRepository } from '../../domain/repositories/comunidad.repository';
import { COMUNIDAD_REPOSITORY } from '../../domain/repositories/comunidad.repository';

@Injectable()
export class EnviarSolicitudContactoUseCase {
  constructor(
    @Inject(COMUNIDAD_REPOSITORY)
    private readonly comunidadRepository: IComunidadRepository,
  ) {}

  async execute(usuarioId: number, contactoId: number): Promise<any> {
    // Validar que no envíe solicitud a sí mismo
    if (usuarioId === contactoId) {
      throw new BadRequestException(
        'No puedes enviar una solicitud a ti mismo',
      );
    }

    // Verificar que el contacto existe
    const contacto =
      await this.comunidadRepository.verificarContactoExiste(contactoId);
    if (!contacto) {
      throw new BadRequestException('El contacto no existe');
    }

    // Verificar si ya existe solicitud pendiente
    const solicitudExistente =
      await this.comunidadRepository.obtenerSolicitudExistente(
        usuarioId,
        contactoId,
      );

    if (solicitudExistente) {
      throw new BadRequestException(
        `Ya existe una solicitud en estado: ${solicitudExistente.estado}`,
      );
    }

    // Crear la solicitud
    return this.comunidadRepository.crearSolicitudContacto(
      usuarioId,
      contactoId,
    );
  }
}
