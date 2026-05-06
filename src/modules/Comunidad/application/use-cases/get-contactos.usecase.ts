import { Injectable, Inject } from '@nestjs/common';
import type { IComunidadRepository } from '../../domain/repositories/comunidad.repository';
import { COMUNIDAD_REPOSITORY } from '../../domain/repositories/comunidad.repository';
import { ContactoEntity } from '../../domain/entities/contacto.entity';

@Injectable()
export class GetContactosUseCase {
  constructor(
    // Usamos el Token para inyectar la interfaz del repositorio
    @Inject(COMUNIDAD_REPOSITORY)
    private readonly comunidadRepository: IComunidadRepository,
  ) {}

  async execute(usuarioId: number): Promise<ContactoEntity[]> {
    // Aquí es donde iría la lógica de negocio pura si la hubiera.
    // Por ejemplo, verificar permisos, filtrar algo específico, etc.

    // Llamamos al puerto (interfaz) para pedir los datos
    const contactos =
      await this.comunidadRepository.obtenerContactos(usuarioId);

    return contactos;
  }
}
