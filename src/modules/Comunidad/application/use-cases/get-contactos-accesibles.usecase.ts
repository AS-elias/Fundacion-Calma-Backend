import { Injectable, Inject } from '@nestjs/common';
import type { IComunidadRepository } from '../../domain/repositories/comunidad.repository';
import { COMUNIDAD_REPOSITORY } from '../../domain/repositories/comunidad.repository';
import { ContactoEntity } from '../../domain/entities/contacto.entity';

@Injectable()
export class GetContactosAccesiblesUseCase {
    constructor(
        @Inject(COMUNIDAD_REPOSITORY)
        private readonly comunidadRepository: IComunidadRepository,
    ) { }

    async execute(usuarioId: number): Promise<ContactoEntity[]> {
        // Contactos con solicitud aceptada + contactos de la misma área
        return this.comunidadRepository.obtenerContactosAccesibles(usuarioId);
    }
}
